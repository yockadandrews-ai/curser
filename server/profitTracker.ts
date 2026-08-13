/**
 * Profit Tracker — CSV export/import, product performance, monthly goal milestones
 */

import { v4 as uuidv4 } from 'uuid';
import {
  getProducts,
  getProduct,
  addProduct,
  getSales,
  addSale,
  getExpenses,
  addExpense,
  getStats,
} from './db.js';
import { getNotionToolSales, getNotionTools } from './notionTools.js';
import { db } from './db.js';

export interface ProductPerformanceRow {
  productId: string;
  productName: string;
  platform: string;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  marginPct: number;
}

export interface ProfitGoalSettings {
  monthlyGoal: number;
}

export interface GoalAlert {
  milestone: 25 | 50 | 75 | 100;
  monthlyProfit: number;
  monthlyGoal: number;
  message: string;
}

export interface ImportResult {
  salesImported: number;
  expensesImported: number;
  productsCreated: number;
  errors: string[];
}

const GOAL_KEY = 'profit_monthly_goal';
const MILESTONES_KEY = 'profit_goal_milestones';

function getSetting<T>(key: string, defaultValue: T): T {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

function setSetting(key: string, value: unknown): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
}

export function getProfitGoal(): ProfitGoalSettings {
  return getSetting<ProfitGoalSettings>(GOAL_KEY, { monthlyGoal: 1000 });
}

export function setProfitGoal(monthlyGoal: number): ProfitGoalSettings {
  const settings = { monthlyGoal: Math.max(0, Number(monthlyGoal) || 0) };
  setSetting(GOAL_KEY, settings);
  return settings;
}

function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMilestonesHit(): Record<string, number[]> {
  return getSetting<Record<string, number[]>>(MILESTONES_KEY, {});
}

function markMilestoneHit(milestone: number): void {
  const key = monthKey();
  const all = getMilestonesHit();
  const hit = new Set(all[key] ?? []);
  hit.add(milestone);
  all[key] = [...hit].sort((a, b) => a - b);
  setSetting(MILESTONES_KEY, all);
}

export function computeMonthlyProfit(): number {
  const stats = getStats();
  return stats.monthlyProfit;
}

export function checkGoalMilestones(
  previousMonthlyProfit: number,
  newMonthlyProfit: number,
): GoalAlert | null {
  const goal = getProfitGoal().monthlyGoal;
  if (goal <= 0) return null;

  const milestones = [25, 50, 75, 100] as const;
  const alreadyHit = new Set(getMilestonesHit()[monthKey()] ?? []);

  for (const pct of milestones) {
    if (alreadyHit.has(pct)) continue;
    const threshold = (goal * pct) / 100;
    if (previousMonthlyProfit < threshold && newMonthlyProfit >= threshold) {
      markMilestoneHit(pct);
      return {
        milestone: pct,
        monthlyProfit: newMonthlyProfit,
        monthlyGoal: goal,
        message:
          pct === 100
            ? `🎉 Monthly goal reached! $${newMonthlyProfit.toFixed(2)} / $${goal.toFixed(2)}`
            : `🎯 ${pct}% of monthly goal — $${newMonthlyProfit.toFixed(2)} / $${goal.toFixed(2)}`,
      };
    }
  }
  return null;
}

function csvEscape(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvEscape).join(',');
}

interface SaleExportRow {
  date: string;
  product: string;
  platform: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
}

function buildSaleExportRows(): SaleExportRow[] {
  const rows: SaleExportRow[] = [];
  const products = getProducts();
  const productMap = new Map(products.map(p => [p.id, p]));

  for (const s of getSales()) {
    const product = productMap.get(s.productId);
    const cost = s.revenue - s.profit;
    const marginPct = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
    rows.push({
      date: s.createdAt.split('T')[0],
      product: product?.name ?? 'Unknown',
      platform: 'affiliate',
      revenue: s.revenue,
      cost,
      profit: s.profit,
      marginPct,
    });
  }

  for (const s of getNotionToolSales(5000)) {
    const cost = s.revenue - s.profit;
    const marginPct = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
    rows.push({
      date: s.createdAt.split('T')[0],
      product: s.toolName ?? 'Notion Tool',
      platform: 'notion',
      revenue: s.revenue,
      cost,
      profit: s.profit,
      marginPct,
    });
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function buildDailySummary(days = 30): Array<{ date: string; revenue: number; cost: number; profit: number }> {
  const saleRows = buildSaleExportRows();
  const byDate = new Map<string, { revenue: number; cost: number; profit: number }>();

  for (const s of saleRows) {
    const cur = byDate.get(s.date) ?? { revenue: 0, cost: 0, profit: 0 };
    cur.revenue += s.revenue;
    cur.cost += s.cost;
    cur.profit += s.profit;
    byDate.set(s.date, cur);
  }

  const result: Array<{ date: string; revenue: number; cost: number; profit: number }> = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const day = byDate.get(key) ?? { revenue: 0, cost: 0, profit: 0 };
    result.push({ date: key, ...day });
  }
  return result;
}

export function buildExportCsv(): string {
  const stats = getStats();
  const saleRows = buildSaleExportRows();
  const expenses = getExpenses();
  const daily = buildDailySummary(30);
  const goal = getProfitGoal();
  const roi = stats.totalExpenses > 0 ? ((stats.netProfit / stats.totalExpenses) * 100).toFixed(1) : 'N/A';

  const lines: string[] = [
    '# Money Magnet Profit Tracker Export',
    `# Generated: ${new Date().toISOString()}`,
    '',
    '# Sales History',
    csvRow(['date', 'product', 'platform', 'revenue', 'cost', 'profit', 'margin_pct']),
  ];

  for (const s of saleRows) {
    lines.push(csvRow([s.date, s.product, s.platform, s.revenue.toFixed(2), s.cost.toFixed(2), s.profit.toFixed(2), s.marginPct.toFixed(1)]));
  }

  lines.push('', '# Expenses', csvRow(['date', 'description', 'type', 'amount']));
  for (const e of expenses) {
    const parts = e.description.split(' — ');
    const type = parts.length > 1 ? parts[0] : 'general';
    const desc = parts.length > 1 ? parts.slice(1).join(' — ') : e.description;
    lines.push(csvRow([e.createdAt.split('T')[0], desc, type, e.amount.toFixed(2)]));
  }

  lines.push('', '# 30-Day Daily Summary', csvRow(['date', 'revenue', 'cost', 'profit']));
  for (const d of daily) {
    lines.push(csvRow([d.date, d.revenue.toFixed(2), d.cost.toFixed(2), d.profit.toFixed(2)]));
  }

  lines.push('', '# P&L Totals');
  lines.push(csvRow(['metric', 'value']));
  lines.push(csvRow(['net_profit', stats.netProfit.toFixed(2)]));
  lines.push(csvRow(['total_revenue', stats.totalRevenue.toFixed(2)]));
  lines.push(csvRow(['total_profit', stats.totalProfit.toFixed(2)]));
  lines.push(csvRow(['total_expenses', stats.totalExpenses.toFixed(2)]));
  lines.push(csvRow(['monthly_profit', stats.monthlyProfit.toFixed(2)]));
  lines.push(csvRow(['monthly_goal', goal.monthlyGoal.toFixed(2)]));
  lines.push(csvRow(['roi_pct', roi]));
  lines.push(csvRow(['total_sales_count', stats.totalSales]));

  return lines.join('\n');
}

export function getProductPerformance(): ProductPerformanceRow[] {
  const products = getProducts();
  const notionTools = getNotionTools();
  const perf = new Map<string, ProductPerformanceRow>();

  const ensure = (id: string, name: string, platform: string) => {
    if (!perf.has(id)) {
      perf.set(id, {
        productId: id,
        productName: name,
        platform,
        unitsSold: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        marginPct: 0,
      });
    }
    return perf.get(id)!;
  };

  for (const p of products) ensure(p.id, p.name, 'affiliate');
  for (const t of notionTools) ensure(t.id, t.name, 'notion');

  for (const s of getSales()) {
    const product = products.find(p => p.id === s.productId);
    const row = ensure(s.productId, product?.name ?? 'Unknown', 'affiliate');
    row.unitsSold += s.quantity;
    row.totalRevenue += s.revenue;
    row.totalCost += s.revenue - s.profit;
    row.totalProfit += s.profit;
  }

  for (const s of getNotionToolSales(5000)) {
    const tool = notionTools.find(t => t.id === s.notionToolId);
    const row = ensure(s.notionToolId, tool?.name ?? s.toolName ?? 'Notion Tool', 'notion');
    row.unitsSold += s.quantity;
    row.totalRevenue += s.revenue;
    row.totalCost += s.revenue - s.profit;
    row.totalProfit += s.profit;
  }

  return [...perf.values()]
    .filter(r => r.unitsSold > 0 || r.totalRevenue > 0)
    .map(r => ({
      ...r,
      marginPct: r.totalRevenue > 0 ? (r.totalProfit / r.totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}

function findOrCreateProduct(name: string, revenue: number, cost: number): { id: string; created: boolean } {
  const products = getProducts();
  const existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return { id: existing.id, created: false };

  const sellPrice = revenue > 0 ? revenue : cost * 1.5 || 10;
  const productCost = cost > 0 ? cost : sellPrice * 0.4;
  const id = uuidv4();
  addProduct({
    id,
    name,
    cost: productCost,
    sellPrice,
    category: 'imported',
    source: 'manual',
    viralScore: 50,
    productType: 'product',
    brand: 'other',
  });
  return { id, created: true };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

export function importCsv(csvText: string, mode: 'merge' | 'replace' = 'merge'): ImportResult {
  const result: ImportResult = { salesImported: 0, expensesImported: 0, productsCreated: 0, errors: [] };
  const lines = csvText.split(/\r?\n/);
  let section = '';

  if (mode === 'replace') {
    db.prepare('DELETE FROM sales').run();
    db.prepare('DELETE FROM expenses').run();
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      if (line.toLowerCase().includes('sales history')) section = 'sales';
      else if (line.toLowerCase().includes('expenses') && !line.toLowerCase().includes('total')) section = 'expenses';
      else if (line.toLowerCase().includes('daily summary')) section = 'skip';
      else if (line.toLowerCase().includes('p&l')) section = 'skip';
      continue;
    }

    const lower = line.toLowerCase();
    if (lower.startsWith('date,') || lower.startsWith('metric,')) continue;

    const cells = parseCsvLine(line);

    try {
      if (section === 'sales' && cells.length >= 6) {
        const [date, product, , revenueStr, , profitStr] = cells;
        const revenue = parseFloat(revenueStr);
        const profit = parseFloat(profitStr);
        if (!product || Number.isNaN(revenue)) continue;

        const productId = findOrCreateProduct(product, revenue, revenue - profit);
        if (productId.created) result.productsCreated++;

        const qty = 1;
        addSale({
          id: uuidv4(),
          productId: productId.id,
          quantity: qty,
          revenue,
          profit: Number.isNaN(profit) ? revenue * 0.4 : profit,
          createdAt: date.includes('T') ? date : `${date}T12:00:00.000Z`,
        });
        result.salesImported++;
      } else if (section === 'expenses' && cells.length >= 3) {
        const [date, description, typeOrAmount, amountMaybe] = cells;
        let desc = description;
        let amount: number;
        if (amountMaybe !== undefined && !Number.isNaN(parseFloat(amountMaybe))) {
          desc = typeOrAmount ? `${typeOrAmount} — ${description}` : description;
          amount = parseFloat(amountMaybe);
        } else {
          amount = parseFloat(typeOrAmount);
        }
        if (Number.isNaN(amount)) continue;
        addExpense({
          id: uuidv4(),
          description: desc,
          amount,
          createdAt: date.includes('T') ? date : `${date}T12:00:00.000Z`,
        });
        result.expensesImported++;
      }
    } catch (e) {
      result.errors.push(`${line.slice(0, 60)}: ${(e as Error).message}`);
    }
  }

  return result;
}

export function seedDemoData(): { products: number; sales: number; expenses: number } {
  const existing = getSales().length + getExpenses().length;
  if (existing > 0) {
    return { products: getProducts().length, sales: getSales().length, expenses: getExpenses().length };
  }

  const demoProducts = [
    { name: 'Wireless Earbuds Pro', cost: 12, sellPrice: 49.99 },
    { name: 'LED Desk Lamp', cost: 8, sellPrice: 29.99 },
    { name: 'Phone Stand', cost: 3, sellPrice: 14.99 },
  ];

  const ids: string[] = [];
  for (const d of demoProducts) {
    const id = uuidv4();
    addProduct({
      id,
      name: d.name,
      cost: d.cost,
      sellPrice: d.sellPrice,
      category: 'electronics',
      source: 'manual',
      viralScore: 75,
      productType: 'product',
      brand: 'other',
    });
    ids.push(id);
  }

  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const productId = ids[i % ids.length];
    const product = getProduct(productId)!;
    const qty = 1 + (i % 3);
    const d = new Date(today);
    d.setDate(d.getDate() - i * 2);
    addSale({
      id: uuidv4(),
      productId,
      quantity: qty,
      revenue: product.sellPrice * qty,
      profit: (product.sellPrice - product.cost) * qty,
      createdAt: d.toISOString(),
    });
  }

  addExpense({ id: uuidv4(), description: 'ads — TikTok campaign', amount: 45, createdAt: new Date().toISOString() });
  addExpense({ id: uuidv4(), description: 'shipping — supplies', amount: 22.5, createdAt: new Date().toISOString() });

  return { products: demoProducts.length, sales: 12, expenses: 2 };
}

/** Quick revenue entry — for Apple Shortcuts (AdSense, affiliate payouts) */
export function recordExternalRevenue(input: {
  source: string;
  amount: number;
  description?: string;
  cost?: number;
}): { saleId: string; revenue: number; profit: number; productName: string; goalAlert: GoalAlert | null } {
  const source = input.source?.trim() || 'AdSense';
  const amount = Math.max(0, Number(input.amount) || 0);
  const cost = Math.max(0, Number(input.cost) || 0);
  const profit = amount - cost;

  let product = getProducts().find(p => p.name.toLowerCase() === source.toLowerCase());
  if (!product) {
    const id = uuidv4();
    addProduct({
      id,
      name: source,
      cost: 0,
      sellPrice: amount || 1,
      category: 'external',
      source: 'manual',
      viralScore: 50,
      productType: 'product',
      brand: 'other',
      description: input.description || `External revenue: ${source}`,
    });
    product = getProduct(id)!;
  }

  const previousMonthly = computeMonthlyProfit();
  const saleId = uuidv4();
  addSale({
    id: saleId,
    productId: product.id,
    quantity: 1,
    revenue: amount,
    profit,
  });
  const newMonthly = computeMonthlyProfit();
  const goalAlert = checkGoalMilestones(previousMonthly, newMonthly);

  return { saleId, revenue: amount, profit, productName: product.name, goalAlert };
}
