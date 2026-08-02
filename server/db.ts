import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getNotionToolSales } from './notionTools.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'autopilot.db');
try {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) {
  console.warn('[db] Could not create data directory:', (e as Error).message);
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  cost: number;
  sellPrice: number;
  category: string;
  productType: 'tool' | 'product';
  brand: 'sgos' | 'other';
  source: 'manual' | 'discovered' | 'inventory';
  viralScore: number;
  stock?: number;
  unitsSold?: number;
  affiliateLink?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  revenue: number;
  profit: number;
  createdAt: string;
  saleType?: 'product' | 'notion_tool';
  itemName?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  productId: string;
  platform: string;
  hook: string;
  caption: string;
  hashtags: string;
  viralScore: number;
  status: 'draft' | 'queued' | 'posted' | 'failed';
  locale?: string;
  createdAt: string;
  postedAt?: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface AutopilotSettings {
  enabled: boolean;
  intervalMinutes: number;
  autoDiscover: boolean;
  autoGenerate: boolean;
  autoPost: boolean;
  platforms: string[];
  niche: string;
  lastRunAt?: string;
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    sell_price REAL NOT NULL,
    category TEXT DEFAULT 'general',
    source TEXT DEFAULT 'manual',
    viral_score REAL DEFAULT 0,
    affiliate_link TEXT,
    image_url TEXT,
    product_type TEXT DEFAULT 'product',
    brand TEXT DEFAULT 'other',
    stock INTEGER DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    revenue REAL NOT NULL,
    profit REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    hook TEXT NOT NULL,
    caption TEXT NOT NULL,
    hashtags TEXT NOT NULL,
    viral_score REAL DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at TEXT NOT NULL,
    posted_at TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migrate existing DB — add SGOS tool columns if missing
const productCols = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
const colNames = new Set(productCols.map(c => c.name));
if (!colNames.has('product_type')) db.exec("ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'product'");
if (!colNames.has('brand')) db.exec("ALTER TABLE products ADD COLUMN brand TEXT DEFAULT 'other'");
if (!colNames.has('stock')) db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0");
if (!colNames.has('units_sold')) db.exec("ALTER TABLE products ADD COLUMN units_sold INTEGER DEFAULT 0");
if (!colNames.has('description')) db.exec("ALTER TABLE products ADD COLUMN description TEXT DEFAULT ''");

const contentCols = db.prepare("PRAGMA table_info(content)").all() as { name: string }[];
const contentColNames = new Set(contentCols.map(c => c.name));
if (!contentColNames.has('locale')) db.exec("ALTER TABLE content ADD COLUMN locale TEXT DEFAULT 'en'");

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

export function getAutopilotSettings(): AutopilotSettings {
  return getSetting<AutopilotSettings>('autopilot', {
    enabled: true,
    intervalMinutes: 5,
    autoDiscover: true,
    autoGenerate: true,
    autoPost: true,
    platforms: ['tiktok', 'instagram', 'twitter'],
    niche: 'side hustle',
  });
}

export function saveAutopilotSettings(settings: AutopilotSettings): void {
  setSetting('autopilot', settings);
}

export function getProducts(filters?: { productType?: string; brand?: string }): Product[] {
  // Affiliate/autopilot products only — Notion tools live in a separate table
  let rows = db.prepare(`
    SELECT * FROM products
    WHERE brand != 'sgos' AND product_type != 'tool'
    ORDER BY viral_score DESC, created_at DESC
  `).all().map(row => mapProduct(row as Record<string, unknown>));
  if (filters?.productType) rows = rows.filter(p => p.productType === filters.productType);
  if (filters?.brand) rows = rows.filter(p => p.brand === filters.brand);
  return rows;
}

export function getProduct(id: string): Product | undefined {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : undefined;
}

export function addProduct(product: Omit<Product, 'createdAt'> & { createdAt?: string }): Product {
  const createdAt = product.createdAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO products (id, name, cost, sell_price, category, source, viral_score, affiliate_link, image_url, created_at,
      product_type, brand, stock, units_sold, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.id, product.name, product.cost, product.sellPrice, product.category,
    product.source, product.viralScore, product.affiliateLink || null, product.imageUrl || null, createdAt,
    product.productType || 'product', product.brand || 'other',
    product.stock ?? 0, product.unitsSold ?? 0, product.description || ''
  );
  return { ...product, createdAt } as Product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | undefined {
  const existing = getProduct(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...updates, id };
  db.prepare(`
    UPDATE products SET name=?, cost=?, sell_price=?, category=?, source=?, viral_score=?, affiliate_link=?, image_url=?,
      product_type=?, brand=?, stock=?, units_sold=?, description=?
    WHERE id=?
  `).run(
    merged.name, merged.cost, merged.sellPrice, merged.category, merged.source, merged.viralScore,
    merged.affiliateLink || null, merged.imageUrl || null,
    merged.productType || 'product', merged.brand || 'other',
    merged.stock ?? 0, merged.unitsSold ?? 0, merged.description || '', id
  );
  return merged;
}

export function recordToolSale(productId: string, quantity: number): Product | undefined {
  const product = getProduct(productId);
  if (!product) return undefined;
  const newStock = Math.max(0, (product.stock ?? 0) - quantity);
  const newSold = (product.unitsSold ?? 0) + quantity;
  return updateProduct(productId, { stock: newStock, unitsSold: newSold });
}

export function deleteProduct(id: string): void {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

export function getSales(): Sale[] {
  return db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all().map(row => mapSale(row as Record<string, unknown>));
}

export function addSale(sale: Omit<Sale, 'createdAt'> & { createdAt?: string }): Sale {
  const createdAt = sale.createdAt || new Date().toISOString();
  db.prepare('INSERT INTO sales (id, product_id, quantity, revenue, profit, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sale.id, sale.productId, sale.quantity, sale.revenue, sale.profit, createdAt);
  return { ...sale, createdAt } as Sale;
}

export function getExpenses(): Expense[] {
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all().map(row => mapExpense(row as Record<string, unknown>));
}

export function addExpense(expense: Omit<Expense, 'createdAt'> & { createdAt?: string }): Expense {
  const createdAt = expense.createdAt || new Date().toISOString();
  db.prepare('INSERT INTO expenses (id, description, amount, created_at) VALUES (?, ?, ?, ?)')
    .run(expense.id, expense.description, expense.amount, createdAt);
  return { ...expense, createdAt } as Expense;
}

export function getContent(): GeneratedContent[] {
  return db.prepare('SELECT * FROM content ORDER BY created_at DESC').all().map(row => mapContent(row as Record<string, unknown>));
}

export function addContent(content: Omit<GeneratedContent, 'createdAt'> & { createdAt?: string }): GeneratedContent {
  const createdAt = content.createdAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO content (id, product_id, platform, hook, caption, hashtags, viral_score, status, created_at, posted_at, locale)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    content.id, content.productId, content.platform, content.hook, content.caption,
    content.hashtags, content.viralScore, content.status, createdAt, content.postedAt || null,
    content.locale || 'en',
  );
  return { ...content, locale: content.locale || 'en', createdAt } as GeneratedContent;
}

export function updateContentStatus(id: string, status: GeneratedContent['status'], postedAt?: string): void {
  db.prepare('UPDATE content SET status = ?, posted_at = ? WHERE id = ?').run(status, postedAt || null, id);
}

export function getActivity(limit = 50): Activity[] {
  return db.prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT ?').all(limit).map(row => mapActivity(row as Record<string, unknown>));
}

export function logActivity(type: string, message: string): Activity {
  const activity: Activity = {
    id: crypto.randomUUID(),
    type,
    message,
    createdAt: new Date().toISOString(),
  };
  db.prepare('INSERT INTO activity (id, type, message, created_at) VALUES (?, ?, ?, ?)')
    .run(activity.id, activity.type, activity.message, activity.createdAt);
  return activity;
}

export function getStats() {
  const products = getProducts();
  const productSales = getSales();
  const notionSales = getNotionToolSales(1000);
  const expenses = getExpenses();
  const content = getContent();

  const allSales = [
    ...productSales,
    ...notionSales.map(s => ({ revenue: s.revenue, profit: s.profit, createdAt: s.createdAt })),
  ];

  const totalRevenue = allSales.reduce((s, x) => s + x.revenue, 0);
  const totalProfit = allSales.reduce((s, x) => s + x.profit, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const netProfit = totalProfit - totalExpenses;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlySales = allSales.filter(s => s.createdAt >= monthStart);
  const monthlyProfit = monthlySales.reduce((s, x) => s + x.profit, 0);

  const postedCount = content.filter(c => c.status === 'posted').length;
  const queuedCount = content.filter(c => c.status === 'queued').length;

  return {
    totalRevenue,
    totalProfit,
    totalExpenses,
    netProfit,
    monthlyProfit,
    totalSales: allSales.length,
    productsTracked: products.length,
    contentGenerated: content.length,
    postsPublished: postedCount,
    postsQueued: queuedCount,
    topProducts: products.slice(0, 5),
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    cost: row.cost as number,
    sellPrice: row.sell_price as number,
    category: row.category as string,
    productType: (row.product_type as Product['productType']) || 'product',
    brand: (row.brand as Product['brand']) || 'other',
    source: row.source as Product['source'],
    viralScore: row.viral_score as number,
    stock: row.stock as number | undefined,
    unitsSold: row.units_sold as number | undefined,
    affiliateLink: row.affiliate_link as string | undefined,
    imageUrl: row.image_url as string | undefined,
    createdAt: row.created_at as string,
  };
}

function mapSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    quantity: row.quantity as number,
    revenue: row.revenue as number,
    profit: row.profit as number,
    createdAt: row.created_at as string,
  };
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    description: row.description as string,
    amount: row.amount as number,
    createdAt: row.created_at as string,
  };
}

function mapContent(row: Record<string, unknown>): GeneratedContent {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    platform: row.platform as string,
    hook: row.hook as string,
    caption: row.caption as string,
    hashtags: row.hashtags as string,
    viralScore: row.viral_score as number,
    status: row.status as GeneratedContent['status'],
    locale: (row.locale as string) || 'en',
    createdAt: row.created_at as string,
    postedAt: row.posted_at as string | undefined,
  };
}

function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    type: row.type as string,
    message: row.message as string,
    createdAt: row.created_at as string,
  };
}

export { db };
