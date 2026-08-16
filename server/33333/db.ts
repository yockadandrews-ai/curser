import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type {
  Brand33333,
  BrandContentRow,
  BrandLeadRow,
  EngagementRow,
  RevenueEventRow,
  ContentStatus,
  FunnelStage,
  EngagementStatus,
} from './types.js';
import { isBrand33333 } from './brands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'autopilot.db');

try {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) {
  console.warn('[33333/db] Could not ensure data directory:', (e as Error).message);
}

export const brandDb = new Database(dbPath);
brandDb.pragma('journal_mode = WAL');

brandDb.exec(`
  CREATE TABLE IF NOT EXISTS brand_content_queue (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    brand TEXT NOT NULL,
    keyword TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    content_json TEXT NOT NULL DEFAULT '{}',
    platforms TEXT NOT NULL DEFAULT '',
    lead_magnet_url TEXT,
    published_at TEXT,
    engagement_score REAL NOT NULL DEFAULT 0,
    leads_generated INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS brand_leads (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    brand TEXT NOT NULL,
    lead_magnet TEXT NOT NULL,
    utm_source TEXT,
    funnel_stage TEXT NOT NULL DEFAULT 'captured',
    captured_at TEXT NOT NULL,
    converted_at TEXT,
    revenue_cents INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS brand_engagements (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    platform TEXT NOT NULL,
    message TEXT NOT NULL,
    reply_draft TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    session_id TEXT,
    created_at TEXT NOT NULL,
    resolved_at TEXT
  );

  CREATE TABLE IF NOT EXISTS brand_revenue_events (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE,
    gross_cents INTEGER NOT NULL,
    brand TEXT NOT NULL,
    product TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'stripe',
    utm_campaign TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_brand_content_status ON brand_content_queue(status);
  CREATE INDEX IF NOT EXISTS idx_brand_leads_email ON brand_leads(email);
  CREATE INDEX IF NOT EXISTS idx_brand_engagements_status ON brand_engagements(status);
`);

function mapContentRow(row: Record<string, unknown>): BrandContentRow {
  return {
    id: row.id as string,
    date: row.date as string,
    brand: row.brand as Brand33333,
    keyword: row.keyword as string,
    status: row.status as ContentStatus,
    contentJson: row.content_json as string,
    platforms: row.platforms as string,
    leadMagnetUrl: (row.lead_magnet_url as string | null) ?? null,
    publishedAt: (row.published_at as string | null) ?? null,
    engagementScore: row.engagement_score as number,
    leadsGenerated: row.leads_generated as number,
    createdAt: row.created_at as string,
  };
}

function mapLeadRow(row: Record<string, unknown>): BrandLeadRow {
  return {
    id: row.id as string,
    email: row.email as string,
    brand: row.brand as Brand33333,
    leadMagnet: row.lead_magnet as string,
    utmSource: (row.utm_source as string | null) ?? null,
    funnelStage: row.funnel_stage as FunnelStage,
    capturedAt: row.captured_at as string,
    convertedAt: (row.converted_at as string | null) ?? null,
    revenueCents: row.revenue_cents as number,
  };
}

function mapEngagementRow(row: Record<string, unknown>): EngagementRow {
  return {
    id: row.id as string,
    brand: row.brand as Brand33333,
    platform: row.platform as string,
    message: row.message as string,
    replyDraft: (row.reply_draft as string | null) ?? null,
    status: row.status as EngagementStatus,
    sessionId: (row.session_id as string | null) ?? null,
    createdAt: row.created_at as string,
    resolvedAt: (row.resolved_at as string | null) ?? null,
  };
}

function mapRevenueRow(row: Record<string, unknown>): RevenueEventRow {
  return {
    id: row.id as string,
    transactionId: row.transaction_id as string,
    grossCents: row.gross_cents as number,
    brand: row.brand as Brand33333,
    product: row.product as string,
    source: row.source as string,
    utmCampaign: (row.utm_campaign as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export function addBrandContent(data: {
  brand: Brand33333;
  keyword: string;
  contentJson: string;
  status?: ContentStatus;
  platforms?: string[];
  leadMagnetUrl?: string;
  date?: string;
}): BrandContentRow {
  const id = uuidv4();
  const now = new Date().toISOString();
  const date = data.date ?? now.slice(0, 10);
  brandDb.prepare(`
    INSERT INTO brand_content_queue (id, date, brand, keyword, status, content_json, platforms, lead_magnet_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    date,
    data.brand,
    data.keyword,
    data.status ?? 'draft',
    data.contentJson,
    (data.platforms ?? []).join(','),
    data.leadMagnetUrl ?? null,
    now,
  );
  return getBrandContentById(id)!;
}

export function getBrandContentById(id: string): BrandContentRow | null {
  const row = brandDb.prepare('SELECT * FROM brand_content_queue WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapContentRow(row) : null;
}

export function getBrandContentQueue(filters?: { status?: ContentStatus; brand?: Brand33333 }): BrandContentRow[] {
  let sql = 'SELECT * FROM brand_content_queue WHERE 1=1';
  const params: unknown[] = [];
  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters?.brand) {
    sql += ' AND brand = ?';
    params.push(filters.brand);
  }
  sql += ' ORDER BY created_at DESC';
  const rows = brandDb.prepare(sql).all(...params) as Record<string, unknown>[];
  return rows.map(mapContentRow);
}

export function updateBrandContentStatus(id: string, status: ContentStatus, extra?: { publishedAt?: string; platforms?: string; engagementScore?: number }): BrandContentRow | null {
  const sets = ['status = ?'];
  const params: unknown[] = [status];
  if (extra?.publishedAt) {
    sets.push('published_at = ?');
    params.push(extra.publishedAt);
  }
  if (extra?.platforms) {
    sets.push('platforms = ?');
    params.push(extra.platforms);
  }
  if (extra?.engagementScore != null) {
    sets.push('engagement_score = ?');
    params.push(extra.engagementScore);
  }
  params.push(id);
  brandDb.prepare(`UPDATE brand_content_queue SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  return getBrandContentById(id);
}

export function getTopPublishedContent(limit = 1): BrandContentRow[] {
  const rows = brandDb.prepare(`
    SELECT * FROM brand_content_queue
    WHERE status IN ('published', 'syndicated')
    ORDER BY engagement_score DESC, published_at DESC
    LIMIT ?
  `).all(limit) as Record<string, unknown>[];
  return rows.map(mapContentRow);
}

export function addBrandLead(data: {
  email: string;
  brand: Brand33333;
  leadMagnet: string;
  utmSource?: string;
}): BrandLeadRow {
  const existing = brandDb.prepare('SELECT * FROM brand_leads WHERE email = ? AND brand = ?').get(data.email, data.brand) as Record<string, unknown> | undefined;
  if (existing) return mapLeadRow(existing);

  const id = uuidv4();
  const now = new Date().toISOString();
  brandDb.prepare(`
    INSERT INTO brand_leads (id, email, brand, lead_magnet, utm_source, funnel_stage, captured_at, revenue_cents)
    VALUES (?, ?, ?, ?, ?, 'captured', ?, 0)
  `).run(id, data.email.toLowerCase().trim(), data.brand, data.leadMagnet, data.utmSource ?? null, now);
  return mapLeadRow(brandDb.prepare('SELECT * FROM brand_leads WHERE id = ?').get(id) as Record<string, unknown>);
}

export function getBrandLeads(limit = 100): BrandLeadRow[] {
  const rows = brandDb.prepare('SELECT * FROM brand_leads ORDER BY captured_at DESC LIMIT ?').all(limit) as Record<string, unknown>[];
  return rows.map(mapLeadRow);
}

export function convertBrandLead(email: string, brand: Brand33333, revenueCents: number): BrandLeadRow | null {
  const row = brandDb.prepare('SELECT * FROM brand_leads WHERE email = ? AND brand = ?').get(email.toLowerCase(), brand) as Record<string, unknown> | undefined;
  if (!row) return null;
  const now = new Date().toISOString();
  brandDb.prepare(`
    UPDATE brand_leads SET funnel_stage = 'converted', converted_at = ?, revenue_cents = ? WHERE id = ?
  `).run(now, revenueCents, row.id);
  return mapLeadRow(brandDb.prepare('SELECT * FROM brand_leads WHERE id = ?').get(row.id) as Record<string, unknown>);
}

export function addEngagement(data: {
  brand: Brand33333;
  platform: string;
  message: string;
  sessionId?: string;
  replyDraft?: string;
  status?: EngagementStatus;
}): EngagementRow {
  const id = uuidv4();
  const now = new Date().toISOString();
  brandDb.prepare(`
    INSERT INTO brand_engagements (id, brand, platform, message, reply_draft, status, session_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.brand,
    data.platform,
    data.message,
    data.replyDraft ?? null,
    data.status ?? 'pending',
    data.sessionId ?? null,
    now,
  );
  return mapEngagementRow(brandDb.prepare('SELECT * FROM brand_engagements WHERE id = ?').get(id) as Record<string, unknown>);
}

export function getPendingEngagements(limit = 20): EngagementRow[] {
  const rows = brandDb.prepare(`
    SELECT * FROM brand_engagements WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?
  `).all(limit) as Record<string, unknown>[];
  return rows.map(mapEngagementRow);
}

export function updateEngagementReply(id: string, replyDraft: string, status: EngagementStatus = 'drafted'): EngagementRow | null {
  brandDb.prepare('UPDATE brand_engagements SET reply_draft = ?, status = ? WHERE id = ?').run(replyDraft, status, id);
  const row = brandDb.prepare('SELECT * FROM brand_engagements WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapEngagementRow(row) : null;
}

export function markEngagementSent(id: string): EngagementRow | null {
  const now = new Date().toISOString();
  brandDb.prepare('UPDATE brand_engagements SET status = ?, resolved_at = ? WHERE id = ?').run('sent', now, id);
  const row = brandDb.prepare('SELECT * FROM brand_engagements WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapEngagementRow(row) : null;
}

export function recordRevenueEvent(data: {
  transactionId: string;
  grossCents: number;
  brand: Brand33333;
  product: string;
  source?: string;
  utmCampaign?: string;
}): RevenueEventRow | null {
  const existing = brandDb.prepare('SELECT id FROM brand_revenue_events WHERE transaction_id = ?').get(data.transactionId);
  if (existing) return null;

  const id = uuidv4();
  const now = new Date().toISOString();
  brandDb.prepare(`
    INSERT INTO brand_revenue_events (id, transaction_id, gross_cents, brand, product, source, utm_campaign, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.transactionId,
    data.grossCents,
    data.brand,
    data.product,
    data.source ?? 'stripe',
    data.utmCampaign ?? null,
    now,
  );
  return mapRevenueRow(brandDb.prepare('SELECT * FROM brand_revenue_events WHERE id = ?').get(id) as Record<string, unknown>);
}

export function getRevenueEvents(limit = 100): RevenueEventRow[] {
  const rows = brandDb.prepare('SELECT * FROM brand_revenue_events ORDER BY created_at DESC LIMIT ?').all(limit) as Record<string, unknown>[];
  return rows.map(mapRevenueRow);
}

export function get33333DashboardStats() {
  const mtdStart = new Date();
  mtdStart.setDate(1);
  const mtdIso = mtdStart.toISOString();

  const mtdRevenue = brandDb.prepare(`
    SELECT COALESCE(SUM(gross_cents), 0) as total FROM brand_revenue_events WHERE created_at >= ?
  `).get(mtdIso) as { total: number };

  const mtdLeads = brandDb.prepare(`
    SELECT COUNT(*) as count FROM brand_leads WHERE captured_at >= ?
  `).get(mtdIso) as { count: number };

  const converted = brandDb.prepare(`
    SELECT COUNT(*) as count FROM brand_leads WHERE funnel_stage = 'converted'
  `).get() as { count: number };

  const published = brandDb.prepare(`
    SELECT COUNT(*) as count FROM brand_content_queue WHERE status IN ('published', 'syndicated')
  `).get() as { count: number };

  const pendingDrafts = brandDb.prepare(`
    SELECT COUNT(*) as count FROM brand_content_queue WHERE status = 'draft'
  `).get() as { count: number };

  const pendingEngagements = brandDb.prepare(`
    SELECT COUNT(*) as count FROM brand_engagements WHERE status = 'pending'
  `).get() as { count: number };

  const revenueByBrand = brandDb.prepare(`
    SELECT brand, COALESCE(SUM(gross_cents), 0) as total, COUNT(*) as transactions
    FROM brand_revenue_events WHERE created_at >= ?
    GROUP BY brand
  `).all(mtdIso) as Array<{ brand: string; total: number; transactions: number }>;

  const monthlyTargetCents = 1_000_000;

  return {
    mtdRevenueCents: mtdRevenue.total,
    mtdLeads: mtdLeads.count,
    conversionRate: mtdLeads.count > 0 ? converted.count / mtdLeads.count : 0,
    publishedCount: published.count,
    pendingDrafts: pendingDrafts.count,
    pendingEngagements: pendingEngagements.count,
    monthlyTargetCents,
    percentOfTarget: monthlyTargetCents > 0 ? mtdRevenue.total / monthlyTargetCents : 0,
    revenueByBrand: revenueByBrand.filter(r => isBrand33333(r.brand)).map(r => ({
      brand: r.brand,
      revenueCents: r.total,
      transactions: r.transactions,
    })),
  };
}

/** Seed demo content queue when empty. */
export function seedDemoContentIfEmpty(): number {
  const count = brandDb.prepare('SELECT COUNT(*) as c FROM brand_content_queue').get() as { c: number };
  if (count.c > 0) return 0;

  const samples = [
    {
      brand: 'vaultverse' as Brand33333,
      keyword: 'music production',
      content: { social_captions: ['New 7-loop pack drops — loops that breathe 🎵'], lead_magnet_cta: 'Get 3 free loops →' },
    },
    {
      brand: 'aurascript' as Brand33333,
      keyword: 'moon calendar',
      content: { social_captions: ['Full moon in Pisces — time to release what no longer serves 🌙'], lead_magnet_cta: 'Free moon calendar →' },
    },
    {
      brand: 'mirrorme' as Brand33333,
      keyword: 'self reflection',
      content: { social_captions: ['Day 3 prompt: What story do you tell yourself that isn\'t true? 🪞'], lead_magnet_cta: 'Start 7-day prompts →' },
    },
  ];

  for (const s of samples) {
    addBrandContent({
      brand: s.brand,
      keyword: s.keyword,
      contentJson: JSON.stringify(s.content),
      status: 'draft',
      platforms: ['instagram', 'blog'],
    });
  }
  return samples.length;
}

/** Seed demo engagements when queue is empty (simulated social inbox). */
export function seedDemoEngagementsIfEmpty(): number {
  const count = brandDb.prepare('SELECT COUNT(*) as c FROM brand_engagements').get() as { c: number };
  if (count.c > 0) return 0;

  const samples = [
    { brand: 'vaultverse' as Brand33333, platform: 'instagram', message: 'Where can I get the full beat pack?' },
    { brand: 'aurascript' as Brand33333, platform: 'youtube', message: 'Does the moon calendar work for Southern Hemisphere?' },
    { brand: 'mirrorme' as Brand33333, platform: 'instagram', message: 'Day 3 prompt hit hard. Is the 30-day program worth it?' },
    { brand: 'resume' as Brand33333, platform: 'twitter', message: 'My score was 54 — will the $9 scan actually help?' },
  ];

  for (const s of samples) addEngagement(s);
  return samples.length;
}
