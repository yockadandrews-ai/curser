import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { buildNotionCatalog, type CatalogToolSeed } from './data/notionToolsCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'autopilot.db');
try {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) {
  console.warn('[notionTools] Could not create data directory:', (e as Error).message);
}

export interface NotionTool {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sellPrice?: number | null;
  cost?: number | null;
  stock?: number;
  unitsSold?: number;
  notionUrl?: string;
  createdAt: string;
}

export interface NotionToolSale {
  id: string;
  notionToolId: string;
  quantity: number;
  revenue: number;
  profit: number;
  createdAt: string;
  toolName?: string;
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notion_tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    sell_price REAL,
    cost REAL,
    stock INTEGER DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    notion_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notion_tool_sales (
    id TEXT PRIMARY KEY,
    notion_tool_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    revenue REAL NOT NULL,
    profit REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (notion_tool_id) REFERENCES notion_tools(id)
  );
`);

function mapNotionTool(row: Record<string, unknown>): NotionTool {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    category: (row.category as string) || undefined,
    sellPrice: row.sell_price != null ? (row.sell_price as number) : null,
    cost: row.cost != null ? (row.cost as number) : null,
    stock: row.stock as number | undefined,
    unitsSold: row.units_sold as number | undefined,
    notionUrl: row.notion_url as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function getNotionTools(): NotionTool[] {
  return db.prepare('SELECT * FROM notion_tools ORDER BY name ASC').all().map(row => mapNotionTool(row as Record<string, unknown>));
}

export function getNotionTool(id: string): NotionTool | undefined {
  const row = db.prepare('SELECT * FROM notion_tools WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapNotionTool(row) : undefined;
}

export function addNotionTool(tool: Omit<NotionTool, 'createdAt'> & { createdAt?: string }): NotionTool {
  const createdAt = tool.createdAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO notion_tools (id, name, description, category, sell_price, cost, stock, units_sold, notion_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tool.id, tool.name, tool.description || '', tool.category || 'general',
    tool.sellPrice ?? null, tool.cost ?? null,
    tool.stock ?? 0, tool.unitsSold ?? 0, tool.notionUrl || null, createdAt
  );
  return { ...tool, createdAt } as NotionTool;
}

export function updateNotionTool(id: string, updates: Partial<NotionTool>): NotionTool | undefined {
  const existing = getNotionTool(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...updates, id };
  db.prepare(`
    UPDATE notion_tools SET name=?, description=?, category=?, sell_price=?, cost=?, stock=?, units_sold=?, notion_url=?
    WHERE id=?
  `).run(
    merged.name, merged.description || '', merged.category || 'general',
    merged.sellPrice ?? null, merged.cost ?? null,
    merged.stock ?? 0, merged.unitsSold ?? 0, merged.notionUrl || null, id
  );
  return merged;
}

export function deleteNotionTool(id: string): void {
  db.prepare('DELETE FROM notion_tools WHERE id = ?').run(id);
}

export function importNotionTools(names: string[]): NotionTool[] {
  const existing = new Set(getNotionTools().map(t => t.name.toLowerCase()));
  const imported: NotionTool[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed || existing.has(trimmed.toLowerCase())) continue;
    const tool = addNotionTool({
      id: crypto.randomUUID(),
      name: trimmed,
    });
    imported.push(tool);
    existing.add(trimmed.toLowerCase());
  }
  return imported;
}

export function seedNotionCatalog(force = false): { imported: number; total: number; skipped: number; pricesSynced: number } {
  if (force) {
    db.prepare('DELETE FROM notion_tools').run();
  }

  const catalog = buildNotionCatalog();
  const existing = new Set(getNotionTools().map(t => t.name.toLowerCase()));
  let imported = 0;

  for (const item of catalog) {
    if (existing.has(item.name.toLowerCase())) continue;
    addNotionTool({
      id: crypto.randomUUID(),
      name: item.name,
      description: item.description,
      category: item.category,
      sellPrice: item.sellPrice,
      cost: 0,
      stock: item.stock,
    });
    existing.add(item.name.toLowerCase());
    imported++;
  }

  const pricesSynced = syncCatalogPrices();

  return { imported, total: getNotionTools().length, skipped: catalog.length - imported, pricesSynced };
}

/** Backfill missing prices from catalog (e.g. Bridge-Builder credits-only pricing) */
export function syncCatalogPrices(): number {
  const catalog = buildNotionCatalog();
  const byName = new Map(catalog.map((c: CatalogToolSeed) => [c.name.toLowerCase(), c]));
  let updated = 0;
  for (const tool of getNotionTools()) {
    if (tool.sellPrice != null && tool.sellPrice > 0) continue;
    const cat = byName.get(tool.name.toLowerCase());
    if (cat?.sellPrice != null && cat.sellPrice > 0) {
      updateNotionTool(tool.id, { sellPrice: cat.sellPrice });
      updated++;
    }
  }
  return updated;
}

function mapNotionToolSale(row: Record<string, unknown>): NotionToolSale {
  return {
    id: row.id as string,
    notionToolId: row.notion_tool_id as string,
    quantity: row.quantity as number,
    revenue: row.revenue as number,
    profit: row.profit as number,
    createdAt: row.created_at as string,
  };
}

export function getNotionToolSales(limit = 100): NotionToolSale[] {
  return db.prepare(`
    SELECT s.*, t.name as tool_name FROM notion_tool_sales s
    LEFT JOIN notion_tools t ON t.id = s.notion_tool_id
    ORDER BY s.created_at DESC LIMIT ?
  `).all(limit).map(row => {
    const r = row as Record<string, unknown>;
    return { ...mapNotionToolSale(r), toolName: r.tool_name as string | undefined };
  });
}

export function addNotionToolSaleRecord(
  toolId: string,
  quantity = 1,
): { sale: NotionToolSale; tool: NotionTool } | null {
  const tool = getNotionTool(toolId);
  if (!tool || tool.sellPrice == null) return null;

  const qty = Math.max(1, quantity);
  const revenue = tool.sellPrice * qty;
  const profit = ((tool.sellPrice ?? 0) - (tool.cost ?? 0)) * qty;
  const createdAt = new Date().toISOString();
  const sale: NotionToolSale = {
    id: crypto.randomUUID(),
    notionToolId: toolId,
    quantity: qty,
    revenue,
    profit,
    createdAt,
    toolName: tool.name,
  };

  db.prepare(`
    INSERT INTO notion_tool_sales (id, notion_tool_id, quantity, revenue, profit, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sale.id, sale.notionToolId, sale.quantity, sale.revenue, sale.profit, sale.createdAt);

  const updatedTool = recordNotionToolSale(toolId, qty);
  if (!updatedTool) return null;

  return { sale, tool: updatedTool };
}

export function getNotionInventorySummary() {
  const tools = getNotionTools();
  const priced = tools.filter(t => t.sellPrice != null && t.sellPrice > 0);
  return {
    totalTools: tools.length,
    pricedTools: priced.length,
    unpricedTools: tools.length - priced.length,
    totalStock: tools.reduce((s, t) => s + (t.stock ?? 0), 0),
    totalSold: tools.reduce((s, t) => s + (t.unitsSold ?? 0), 0),
    hasPriceList: priced.length > 0,
    tools,
  };
}

export function recordNotionToolSale(id: string, quantity = 1): NotionTool | undefined {
  const tool = getNotionTool(id);
  if (!tool) return undefined;
  if (tool.sellPrice == null) return undefined;
  const newStock = Math.max(0, (tool.stock ?? 0) - quantity);
  const newSold = (tool.unitsSold ?? 0) + quantity;
  return updateNotionTool(id, { stock: newStock, unitsSold: newSold });
}

/** Remove SGOS tools that were incorrectly mixed into the affiliate products table */
export function cleanupMixedSgosProducts(dbMain: Database.Database): number {
  const ids = dbMain.prepare("SELECT id FROM products WHERE brand = 'sgos' OR product_type = 'tool'").all() as { id: string }[];
  if (ids.length === 0) return 0;
  const idList = ids.map(r => r.id);
  const placeholders = idList.map(() => '?').join(',');
  dbMain.prepare(`DELETE FROM content WHERE product_id IN (${placeholders})`).run(...idList);
  dbMain.prepare(`DELETE FROM sales WHERE product_id IN (${placeholders})`).run(...idList);
  const result = dbMain.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...idList);
  return result.changes;
}

export { db as notionDb };
