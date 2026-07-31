import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/autopilot.db');

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
  const result = dbMain.prepare("DELETE FROM products WHERE brand = 'sgos' OR product_type = 'tool'").run();
  return result.changes;
}

export { db as notionDb };
