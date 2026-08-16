import express, { type Express, type Request, type Response } from 'express';
import { BRAND_META, BRAND_PRODUCTS, isBrand33333 } from './brands.js';
import {
  addBrandContent,
  addBrandLead,
  get33333DashboardStats,
  getBrandContentQueue,
  getBrandLeads,
  getRevenueEvents,
  updateBrandContentStatus,
  markEngagementSent,
  getPendingEngagements,
  seedDemoContentIfEmpty,
  seedDemoEngagementsIfEmpty,
} from './db.js';
import { draftRepliesForPending, getEngagementPending } from './engagement.js';
import { getN8n33333Config, verify33333Secret } from './n8nConfig.js';
import { parsePublishBody, publishBrandContent, publishByContentId } from './publisher.js';
import { syndicateContent } from './syndicate.js';
import { getStoreProducts, getStoreByBrand, getFeaturedCheckoutLinks, countConfiguredStripeLinks } from './stripeLinks.js';
import { getConvertKitConfig, subscribeToWelcomeSequence, tagAbandonedCart } from './convertkit.js';
import type { Brand33333 } from './types.js';

function require33333Secret(req: Request, res: Response): boolean {
  if (!verify33333Secret(req.headers['x-33333-secret'] as string | undefined)) {
    res.status(401).json({ error: 'Invalid X-33333-Secret' });
    return false;
  }
  return true;
}

export function register33333Routes(app: Express): void {
  // n8n Fire — publish approved content (legacy + namespaced paths)
  const publishHandler: express.RequestHandler = async (req, res) => {
    if (!require33333Secret(req, res)) return;

    if (req.body.content_id && !req.body.content) {
      const result = await publishByContentId(String(req.body.content_id));
      if ('error' in result) return res.status(404).json(result);
      return res.json(result);
    }

    const parsed = parsePublishBody(req.body);
    if ('error' in parsed) return res.status(400).json(parsed);

    try {
      const result = await publishBrandContent(parsed);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  };
  app.post('/api/content/publish', publishHandler);
  app.post('/api/33333/n8n/publish', publishHandler);

  // n8n Water — pending comments/DMs
  const engagementHandler: express.RequestHandler = async (req, res) => {
    if (!require33333Secret(req, res)) return;

    if (req.query.draft === 'true') {
      await draftRepliesForPending();
    }

    const items = getEngagementPending(true);
    res.json(items.length === 1 ? items[0] : items);
  };
  app.get('/api/engagement/pending', engagementHandler);
  app.get('/api/33333/n8n/engagement/pending', engagementHandler);

  // n8n Earth — syndicate top performer
  const syndicateHandler: express.RequestHandler = async (req, res) => {
    if (!require33333Secret(req, res)) return;

    const contentId = String(req.body.content_id ?? req.body.contentId ?? '');
    const platforms = (req.body.platforms as string[] | undefined) ?? ['tiktok', 'twitter'];
    if (!contentId) return res.status(400).json({ error: 'content_id required' });

    try {
      const result = await syndicateContent({ content_id: contentId, platforms, format: req.body.format });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  };
  app.post('/api/content/syndicate', syndicateHandler);
  app.post('/api/33333/n8n/syndicate', syndicateHandler);

  // Dashboard API
  app.get('/api/33333/dashboard', (_req, res) => {
    seedDemoContentIfEmpty();
    seedDemoEngagementsIfEmpty();
    res.json({
      stats: get33333DashboardStats(),
      brands: BRAND_META,
      products: BRAND_PRODUCTS,
      store: getStoreProducts(),
      stripeLinksConfigured: countConfiguredStripeLinks(),
      convertkit: getConvertKitConfig(),
      contentQueue: getBrandContentQueue().slice(0, 20),
      leads: getBrandLeads(20),
      revenue: getRevenueEvents(20),
      engagements: getPendingEngagements(10),
      n8n: getN8n33333Config(),
    });
  });

  app.get('/api/33333/store', (_req, res) => {
    res.json({
      products: getStoreProducts(),
      byBrand: getStoreByBrand(),
      featured: getFeaturedCheckoutLinks(),
      stripeLinksConfigured: countConfiguredStripeLinks(),
      totalProducts: BRAND_PRODUCTS.length,
      convertkitConfigured: getConvertKitConfig().configured,
    });
  });

  app.get('/api/33333/content-queue', (req, res) => {
    const status = req.query.status as string | undefined;
    const brand = req.query.brand as string | undefined;
    res.json(getBrandContentQueue({
      status: status as import('./types.js').ContentStatus | undefined,
      brand: brand && isBrand33333(brand) ? brand : undefined,
    }));
  });

  app.post('/api/33333/content-queue', (req, res) => {
    const { brand, keyword, content, platforms, leadMagnetUrl } = req.body;
    if (!brand || !isBrand33333(brand)) return res.status(400).json({ error: 'valid brand required' });
    if (!keyword) return res.status(400).json({ error: 'keyword required' });

    const row = addBrandContent({
      brand: brand as Brand33333,
      keyword,
      contentJson: JSON.stringify(content ?? {}),
      platforms,
      leadMagnetUrl,
      status: 'draft',
    });
    res.status(201).json(row);
  });

  app.put('/api/33333/content-queue/:id/approve', (req, res) => {
    const row = updateBrandContentStatus(req.params.id, 'approved');
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });

  app.post('/api/33333/content-queue/:id/publish', async (req, res) => {
    const result = await publishByContentId(req.params.id);
    if ('error' in result) return res.status(404).json(result);
    res.json(result);
  });

  app.post('/api/33333/leads', async (req, res) => {
    const { email, firstName, first_name, brand, lead_magnet, leadMagnet, utm_source, utmSource } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' });
    if (!brand || !isBrand33333(brand)) return res.status(400).json({ error: 'valid brand required' });

    const magnet = lead_magnet ?? leadMagnet ?? 'general';
    const lead = addBrandLead({
      email,
      brand: brand as Brand33333,
      leadMagnet: magnet,
      utmSource: utm_source ?? utmSource,
    });

    const emailResult = await subscribeToWelcomeSequence({
      email,
      firstName: firstName ?? first_name,
      brand: brand as Brand33333,
      leadMagnet: magnet,
      utmSource: utm_source ?? utmSource,
    });

    res.status(201).json({ ok: true, lead, email: emailResult });
  });

  app.post('/api/33333/email/abandoned-cart', async (req, res) => {
    const { email, productName, product_name } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    const result = await tagAbandonedCart(email, productName ?? product_name);
    res.json(result);
  });

  app.get('/api/33333/engagements', (_req, res) => {
    res.json(getPendingEngagements(50));
  });

  app.post('/api/33333/engagements/:id/send', (req, res) => {
    const row = markEngagementSent(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });

  app.get('/api/33333/n8n/config', (_req, res) => {
    res.json(getN8n33333Config());
  });

  app.post('/api/33333/n8n/test', async (req, res) => {
    if (!require33333Secret(req, res)) return;

    const brand = (req.body.brand as string | undefined) ?? 'vaultverse';
    if (!isBrand33333(brand)) return res.status(400).json({ error: 'invalid brand' });

    const result = await publishBrandContent({
      brand,
      content: {
        social_captions: [`33333 smoke test — ${brand} · ${new Date().toISOString()}`],
        lead_magnet_cta: 'Get the free pack →',
      },
      platforms: ['blog', 'twitter'],
    });

    res.json({ ok: true, config: getN8n33333Config(), publish: result });
  });
}
