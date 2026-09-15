import type { Express, Request, Response } from 'express';
import { isBrand33333 } from './brands.js';
import { verify33333Secret } from './n8nConfig.js';
import {
  archiveLowPerformers,
  buildHookVariantsPrompt,
  buildV3ScriptPrompt,
  calculateVelocityMetrics,
  createViralShortPost,
  detectAiAvatarLeaks,
  getHookVariantSet,
  getPostsDueForVelocityCheck,
  isWeekendLock,
  markPostPublished,
  optimizeScriptForPlatform,
  pickHookVariant,
  saveHookVariantSet,
  updatePostMetrics,
  type HookVariant,
  type ShortPlatform,
} from './viralShorts.js';
import type { Brand33333 } from './types.js';

function require33333Secret(req: Request, res: Response): boolean {
  if (!verify33333Secret(req.headers['x-33333-secret'] as string | undefined)) {
    res.status(401).json({ error: 'Invalid X-33333-Secret' });
    return false;
  }
  return true;
}

export function register33333ViralRoutes(app: Express): void {
  /** Fire block gate — weekend lock check. */
  app.get('/api/33333/viral/weekend-lock', (_req, res) => {
    const locked = isWeekendLock();
    res.json({ locked, message: locked ? 'Weekend lock active — no shorts generation Sat/Sun' : 'Clear' });
  });

  /** Prompts for n8n Gemini nodes. */
  app.get('/api/33333/viral/prompts/hooks', (req, res) => {
    const topic = String(req.query.topic ?? 'career growth for junior devs');
    const brand = String(req.query.brand ?? 'vaultverse');
    res.json({ prompt: buildHookVariantsPrompt(topic, brand) });
  });

  app.get('/api/33333/viral/prompts/script', (req, res) => {
    const topic = String(req.query.topic ?? 'career growth');
    const hook = String(req.query.hook ?? 'Stop applying to 100 jobs');
    const variant = (String(req.query.variant ?? 'A') as HookVariant);
    res.json({ prompt: buildV3ScriptPrompt(topic, hook, variant) });
  });

  /** Save A/B/C hook set from n8n after Gemini generation. */
  app.post('/api/33333/viral/hooks', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const { brand, topic, hooks, scripts } = req.body;
    if (!brand || !isBrand33333(brand)) return res.status(400).json({ error: 'valid brand required' });
    if (!topic || !hooks?.A || !hooks?.B || !hooks?.C) {
      return res.status(400).json({ error: 'topic and hooks A/B/C required' });
    }
    const set = saveHookVariantSet({
      brand: brand as Brand33333,
      topic,
      variantA: hooks.A,
      variantB: hooks.B,
      variantC: hooks.C,
      scriptsJson: scripts,
    });
    res.status(201).json(set);
  });

  /** Founder picks winning hook via email link or dashboard. */
  app.post('/api/33333/viral/hooks/:id/pick', (req, res) => {
    const variant = req.body.variant as HookVariant;
    if (!['A', 'B', 'C'].includes(variant)) return res.status(400).json({ error: 'variant must be A, B, or C' });
    const set = pickHookVariant(req.params.id, variant);
    if (!set) return res.status(404).json({ error: 'not found' });
    res.json(set);
  });

  app.get('/api/33333/viral/hooks/:id', (req, res) => {
    const set = getHookVariantSet(req.params.id);
    if (!set) return res.status(404).json({ error: 'not found' });
    res.json(set);
  });

  /** Metadata hygiene + AI avatar block (mirrors Python script). */
  app.post('/api/33333/viral/metadata-hygiene', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const check = detectAiAvatarLeaks(req.body);
    res.json({ ok: !check.blocked, ...check });
  });

  /** Platform-specific script optimization. */
  app.post('/api/33333/viral/optimize', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const { script, platform } = req.body;
    if (!script || !platform) return res.status(400).json({ error: 'script and platform required' });
    const p = platform as ShortPlatform;
    if (!['youtube', 'tiktok', 'instagram'].includes(p)) {
      return res.status(400).json({ error: 'platform must be youtube, tiktok, or instagram' });
    }
    res.json(optimizeScriptForPlatform(script, p));
  });

  /** Create + publish native per-platform posts. */
  app.post('/api/33333/viral/publish', async (req, res) => {
    if (!require33333Secret(req, res)) return;
    const { brand, topic, hookVariant, script, platforms } = req.body;
    if (!brand || !topic || !script) return res.status(400).json({ error: 'brand, topic, script required' });

    const targetPlatforms = (platforms as ShortPlatform[] | undefined) ?? ['youtube', 'instagram', 'tiktok'];
    const posts = targetPlatforms.map((platform) => {
      const optimized = optimizeScriptForPlatform(script, platform);
      const post = createViralShortPost({
        brand: brand as Brand33333,
        topic,
        hookVariant: (hookVariant ?? 'A') as HookVariant,
        script: optimized,
        platform,
      });
      return markPostPublished(post.id)!;
    });

    res.status(201).json({ posts, velocityCheckInHours: 2 });
  });

  /** 2-hour velocity check — K-factor + viral tier. */
  app.post('/api/33333/viral/velocity-check', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const { postId, views, shares, saves, likes, comments } = req.body;

    if (postId) {
      const updated = updatePostMetrics(postId, {
        views: Number(views ?? 0),
        shares: Number(shares ?? 0),
        saves: Number(saves ?? 0),
        likes: Number(likes ?? 0),
        comments: Number(comments ?? 0),
      });
      if (!updated) return res.status(404).json({ error: 'post not found' });
      const metrics = calculateVelocityMetrics({
        views: updated.views,
        shares: updated.shares,
        saves: updated.saves,
        likes: updated.likes,
        comments: updated.comments,
      });
      return res.json({ post: updated, ...metrics });
    }

    const due = getPostsDueForVelocityCheck();
    const results = due.map((post) => {
      const simulated = {
        views: post.views || Math.floor(Math.random() * 500) + 50,
        shares: post.shares || Math.floor(Math.random() * 20),
        saves: post.saves || Math.floor(Math.random() * 15),
        likes: post.likes || Math.floor(Math.random() * 40),
        comments: post.comments || Math.floor(Math.random() * 10),
      };
      const updated = updatePostMetrics(post.id, simulated)!;
      const metrics = calculateVelocityMetrics(simulated);
      return { post: updated, ...metrics };
    });

    const archived = archiveLowPerformers();
    res.json({ checked: results.length, results, archivedLow: archived });
  });

  app.get('/api/33333/viral/config', (_req, res) => {
    res.json({
      version: '3.0',
      workflowImportPath: 'docs/n8n/33333-viral-shorts-engine-v3.workflow.json',
      fireBlockTime: '10:10 AM CDT',
      weekendLock: true,
      platformLengths: { youtube: '30-45s', tiktok: '45-90s', instagram: '30-60s' },
      viralTiers: {
        VIRAL: 'K > 1.0, engagement > 5% → Boost $20-50',
        HIGH: 'K > 0.5, engagement > 3% → Respond + $10 boost',
        MEDIUM: 'K > 0.3, engagement > 2% → Monitor 2h',
        LOW: 'Kill hook pattern, archive',
      },
      pythonScripts: [
        'scripts/metadata_hygiene.py',
        'scripts/transform_layer.py',
        'scripts/stripe_ledger.py',
      ],
    });
  });
}
