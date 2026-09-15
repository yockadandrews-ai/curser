import { v4 as uuidv4 } from 'uuid';
import { brandDb } from './db.js';
import type { Brand33333 } from './types.js';

export type ViralTier = 'VIRAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type HookVariant = 'A' | 'B' | 'C';
export type ShortPlatform = 'youtube' | 'tiktok' | 'instagram';

export const PLATFORM_TARGET_SECONDS: Record<ShortPlatform, { min: number; max: number; default: number }> = {
  youtube: { min: 30, max: 45, default: 35 },
  tiktok: { min: 45, max: 90, default: 60 },
  instagram: { min: 30, max: 60, default: 45 },
};

export const RULES_2026 = [
  'First 0.5 seconds must stop the swipe — lead with pattern interrupt',
  'Hard [VISUAL CUE] every 3-4 seconds — no static frame >4s',
  'Include dedicated SHARE_BAIT section — design for spread not likes',
  'Engagement question must require 5+ word answers — no yes/no',
  'No AI avatar faces — real footage, b-roll, text-on-screen only',
  'Loop end frame to opening — organic rewatch, not obvious jump cut',
  'Native upload per platform — no cross-platform watermarks',
] as const;

export interface ViralShortPost {
  id: string;
  brand: Brand33333;
  topic: string;
  hookVariant: HookVariant;
  scriptJson: string;
  platform: ShortPlatform;
  targetSeconds: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived' | 'blocked';
  publishedAt: string | null;
  views: number;
  shares: number;
  saves: number;
  likes: number;
  comments: number;
  kFactor: number;
  engagementRate: number;
  viralTier: ViralTier | null;
  velocityCheckAt: string | null;
  createdAt: string;
}

export interface HookVariantSet {
  id: string;
  brand: Brand33333;
  topic: string;
  variantA: string;
  variantB: string;
  variantC: string;
  scriptsJson: string;
  selectedVariant: HookVariant | null;
  status: 'pending_pick' | 'picked' | 'archived';
  createdAt: string;
}

brandDb.exec(`
  CREATE TABLE IF NOT EXISTS viral_hook_sets (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    topic TEXT NOT NULL,
    variant_a TEXT NOT NULL,
    variant_b TEXT NOT NULL,
    variant_c TEXT NOT NULL,
    scripts_json TEXT NOT NULL DEFAULT '{}',
    selected_variant TEXT,
    status TEXT NOT NULL DEFAULT 'pending_pick',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS viral_short_posts (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    topic TEXT NOT NULL,
    hook_variant TEXT NOT NULL,
    script_json TEXT NOT NULL,
    platform TEXT NOT NULL,
    target_seconds INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    saves INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    k_factor REAL NOT NULL DEFAULT 0,
    engagement_rate REAL NOT NULL DEFAULT 0,
    viral_tier TEXT,
    velocity_check_at TEXT,
    created_at TEXT NOT NULL
  );
`);

function mapPost(row: Record<string, unknown>): ViralShortPost {
  return {
    id: row.id as string,
    brand: row.brand as Brand33333,
    topic: row.topic as string,
    hookVariant: row.hook_variant as HookVariant,
    scriptJson: row.script_json as string,
    platform: row.platform as ShortPlatform,
    targetSeconds: row.target_seconds as number,
    status: row.status as ViralShortPost['status'],
    publishedAt: (row.published_at as string | null) ?? null,
    views: row.views as number,
    shares: row.shares as number,
    saves: row.saves as number,
    likes: row.likes as number,
    comments: row.comments as number,
    kFactor: row.k_factor as number,
    engagementRate: row.engagement_rate as number,
    viralTier: (row.viral_tier as ViralTier | null) ?? null,
    velocityCheckAt: (row.velocity_check_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

/** Weekend lock — Sat/Sun hard stop for Fire block shorts. */
export function isWeekendLock(date: Date = new Date()): boolean {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
  });
  const day = fmt.format(date);
  return day === 'Sat' || day === 'Sun';
}

/** K-factor = (shares + saves) / max(views, 1). Engagement = weighted interactions / views. */
export function calculateVelocityMetrics(metrics: {
  views: number;
  shares: number;
  saves: number;
  likes: number;
  comments: number;
}): { kFactor: number; engagementRate: number; viralTier: ViralTier; recommendation: string } {
  const views = Math.max(metrics.views, 1);
  const kFactor = (metrics.shares + metrics.saves) / views;
  const engagementRate = (metrics.shares + metrics.saves + metrics.likes + metrics.comments) / views;

  let viralTier: ViralTier;
  let recommendation: string;

  if (kFactor > 1.0 && engagementRate > 0.05) {
    viralTier = 'VIRAL';
    recommendation = 'Boost $20-50 immediately';
  } else if (kFactor > 0.5 && engagementRate > 0.03) {
    viralTier = 'HIGH';
    recommendation = 'Respond to all comments, consider $10 boost';
  } else if (kFactor > 0.3 && engagementRate > 0.02) {
    viralTier = 'MEDIUM';
    recommendation = 'Monitor, check again in 2h';
  } else {
    viralTier = 'LOW';
    recommendation = 'Kill this hook pattern. Archive. Move on.';
  }

  return { kFactor, engagementRate, viralTier, recommendation };
}

/** Gemini system prompt enforcing 2026 elite tactics. */
export function buildV3ScriptPrompt(topic: string, hook: string, variant: HookVariant): string {
  return `You are the 33333 Viral Shorts Engine v3.0. Write a ${variant} variant script for: "${topic}".

HOOK (first 0.5s — must stop swipe): ${hook}

2026 NON-NEGOTIABLES (enforce all):
${RULES_2026.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Return strict JSON only:
{
  "variant": "${variant}",
  "hook_0_5s": "pattern interrupt line",
  "script_body": "full spoken script with [VISUAL CUE] tags every 3-4 seconds",
  "share_bait": "line designed to make viewers send to a friend",
  "engagement_question": "question requiring 5+ word answer",
  "loop_bridge": "last frame connects to opening",
  "duration_seconds": 35,
  "platform_notes": { "youtube": 35, "instagram": 45, "tiktok": 60 }
}`;
}

export function buildHookVariantsPrompt(topic: string, brand: string): string {
  return `Generate 3 hook variants (A/B/C) for a viral short about "${topic}" (brand: ${brand}).
Each hook must win in the first 0.5 seconds. No AI avatar. Share-bait angle required.

Return strict JSON:
{
  "topic": "${topic}",
  "hooks": {
    "A": "hook text",
    "B": "hook text",
    "C": "hook text"
  }
}`;
}

export function saveHookVariantSet(data: {
  brand: Brand33333;
  topic: string;
  variantA: string;
  variantB: string;
  variantC: string;
  scriptsJson?: Record<string, unknown>;
}): HookVariantSet {
  const id = uuidv4();
  const now = new Date().toISOString();
  brandDb.prepare(`
    INSERT INTO viral_hook_sets (id, brand, topic, variant_a, variant_b, variant_c, scripts_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_pick', ?)
  `).run(id, data.brand, data.topic, data.variantA, data.variantB, data.variantC, JSON.stringify(data.scriptsJson ?? {}), now);

  return {
    id,
    brand: data.brand,
    topic: data.topic,
    variantA: data.variantA,
    variantB: data.variantB,
    variantC: data.variantC,
    scriptsJson: JSON.stringify(data.scriptsJson ?? {}),
    selectedVariant: null,
    status: 'pending_pick',
    createdAt: now,
  };
}

export function getHookVariantSet(id: string): HookVariantSet | null {
  const row = brandDb.prepare('SELECT * FROM viral_hook_sets WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: row.id as string,
    brand: row.brand as Brand33333,
    topic: row.topic as string,
    variantA: row.variant_a as string,
    variantB: row.variant_b as string,
    variantC: row.variant_c as string,
    scriptsJson: row.scripts_json as string,
    selectedVariant: (row.selected_variant as HookVariant | null) ?? null,
    status: row.status as HookVariantSet['status'],
    createdAt: row.created_at as string,
  };
}

export function pickHookVariant(setId: string, variant: HookVariant): HookVariantSet | null {
  brandDb.prepare(`
    UPDATE viral_hook_sets SET selected_variant = ?, status = 'picked' WHERE id = ?
  `).run(variant, setId);
  return getHookVariantSet(setId);
}

export function createViralShortPost(data: {
  brand: Brand33333;
  topic: string;
  hookVariant: HookVariant;
  script: Record<string, unknown>;
  platform: ShortPlatform;
}): ViralShortPost {
  const id = uuidv4();
  const now = new Date().toISOString();
  const targetSeconds = PLATFORM_TARGET_SECONDS[data.platform].default;
  brandDb.prepare(`
    INSERT INTO viral_short_posts (
      id, brand, topic, hook_variant, script_json, platform, target_seconds, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)
  `).run(id, data.brand, data.topic, data.hookVariant, JSON.stringify(data.script), data.platform, targetSeconds, now);

  return mapPost(brandDb.prepare('SELECT * FROM viral_short_posts WHERE id = ?').get(id) as Record<string, unknown>);
}

export function markPostPublished(id: string): ViralShortPost | null {
  const now = new Date().toISOString();
  const checkAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  brandDb.prepare(`
    UPDATE viral_short_posts SET status = 'published', published_at = ?, velocity_check_at = ? WHERE id = ?
  `).run(now, checkAt, id);
  const row = brandDb.prepare('SELECT * FROM viral_short_posts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapPost(row) : null;
}

export function updatePostMetrics(id: string, metrics: {
  views: number;
  shares: number;
  saves: number;
  likes: number;
  comments: number;
}): ViralShortPost | null {
  const { kFactor, engagementRate, viralTier } = calculateVelocityMetrics(metrics);
  brandDb.prepare(`
    UPDATE viral_short_posts SET
      views = ?, shares = ?, saves = ?, likes = ?, comments = ?,
      k_factor = ?, engagement_rate = ?, viral_tier = ?
    WHERE id = ?
  `).run(metrics.views, metrics.shares, metrics.saves, metrics.likes, metrics.comments, kFactor, engagementRate, viralTier, id);
  const row = brandDb.prepare('SELECT * FROM viral_short_posts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapPost(row) : null;
}

export function getPostsDueForVelocityCheck(): ViralShortPost[] {
  const now = new Date().toISOString();
  const rows = brandDb.prepare(`
    SELECT * FROM viral_short_posts
    WHERE status = 'published' AND velocity_check_at IS NOT NULL AND velocity_check_at <= ?
  `).all(now) as Record<string, unknown>[];
  return rows.map(mapPost);
}

export function archiveLowPerformers(): number {
  const result = brandDb.prepare(`
    UPDATE viral_short_posts SET status = 'archived'
    WHERE viral_tier = 'LOW' AND status = 'published'
  `).run();
  return result.changes;
}

/** AI avatar / synthetic face leak detection (metadata flags). */
export function detectAiAvatarLeaks(payload: {
  metadata?: Record<string, unknown>;
  filename?: string;
  headers?: Record<string, string>;
}): { blocked: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const blob = JSON.stringify(payload).toLowerCase();

  const blockedVendors = ['heygen', 'synthesia', 'd-id', 'did.com', 'deepfake', 'ai avatar', 'talking head ai'];
  for (const vendor of blockedVendors) {
    if (blob.includes(vendor)) reasons.push(`Detected vendor leak: ${vendor}`);
  }

  if (payload.filename && /avatar|heygen|synth/i.test(payload.filename)) {
    reasons.push('Filename suggests AI avatar asset');
  }

  return { blocked: reasons.length > 0, reasons };
}

export function optimizeScriptForPlatform(script: Record<string, unknown>, platform: ShortPlatform): Record<string, unknown> {
  const target = PLATFORM_TARGET_SECONDS[platform].default;
  return {
    ...script,
    platform,
    target_seconds: target,
    caption_native: true,
    watermark_free: true,
    optimized_at: new Date().toISOString(),
  };
}
