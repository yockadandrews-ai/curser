import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  getProducts, getProduct, addProduct, updateProduct, deleteProduct,
  getSales, addSale, getExpenses, addExpense,
  getContent, addContent, getActivity, getStats,
  getAutopilotSettings, saveAutopilotSettings,
} from './db.js';
import { discoverTopProducts, getTopProducts } from './services/productDiscovery.js';
import { generateContentForProduct, generateAndSaveContent, generateWithAI } from './services/contentGenerator.js';
import { publishQueuedPosts, getSocialStatus } from './services/socialPoster.js';
import { runAutopilotCycle, getAutopilotStatus, startAutopilotScheduler, stopAutopilotScheduler } from './autopilot.js';
import {
  getNotionTools, getNotionTool, addNotionTool, updateNotionTool, deleteNotionTool,
  importNotionTools, getNotionInventorySummary, recordNotionToolSale, cleanupMixedSgosProducts,
  seedNotionCatalog,
} from './notionTools.js';
import { expandAllOutputFolders } from './factory/expandProposals.js';
import { NOTION_CATALOG_STATS } from './data/notionToolsCatalog.js';
import { generateDailyRun, getFactoryRuns, getFactoryRun, FACTORY_THEMES, getThemeForDay, OUTPUT_ROOT,
  generateMultiThemeRun, generateThreeThemePackage, generateFiveThemePackage, getMultiThemeRuns, getMultiThemeRun,
} from './factory/generator.js';
import { getI18nCatalog, resolveRequestLocale, setLocalePreference } from './i18n/index.js';
import { writeMultilingualPackage } from './i18n/multilingualProposals.js';
import { buildLeadLocalizedPrompt } from './i18n/leadLocale.js';
import {
  getLeads, getLead, addLead, updateLead, setLeadLocale, resolveLeadLocale, enrichLeadWithLocale,
} from './leads.js';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Remove SGOS tools that were incorrectly mixed into affiliate products
const removed = cleanupMixedSgosProducts(db);
if (removed > 0) console.log(`[Cleanup] Removed ${removed} SGOS tools from affiliate products (now separate)`);

app.use(cors());
app.use(express.json());

// i18n — language catalog and user preference
app.get('/api/i18n/languages', (_req, res) => res.json(getI18nCatalog()));
app.get('/api/i18n/locale', (req, res) => {
  const locale = resolveRequestLocale(req.headers['accept-language'] as string | undefined);
  res.json({ locale, catalog: getI18nCatalog() });
});
app.put('/api/i18n/locale', (req, res) => {
  const { locale } = req.body;
  if (!locale) return res.status(400).json({ error: 'locale required' });
  const saved = setLocalePreference(locale);
  res.json({ locale: saved });
});

// Leads — per-lead language override (Bridge-Builder & Echo-Scale)
app.get('/api/leads', (req, res) => {
  const sourceApp = req.query.sourceApp as string | undefined;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  const leads = getLeads(sourceApp as import('./leads.js').LeadSourceApp | undefined)
    .map(l => enrichLeadWithLocale(l, acceptLanguage));
  res.json(leads);
});
app.get('/api/leads/:id', (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  res.json(enrichLeadWithLocale(lead, acceptLanguage));
});
app.get('/api/leads/:id/locale', (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  const accountLocale = resolveRequestLocale(acceptLanguage);
  res.json(resolveLeadLocale(req.params.id, { acceptLanguage, accountLocale }));
});
app.post('/api/leads', (req, res) => {
  const { name, email, company, preferredLocale, sourceApp, acceptLanguage } = req.body;
  if (!name || !sourceApp) return res.status(400).json({ error: 'name and sourceApp required' });
  if (!['bridge-builder', 'echo-scale'].includes(sourceApp)) {
    return res.status(400).json({ error: 'sourceApp must be bridge-builder or echo-scale' });
  }
  const lead = addLead({ name, email, company, preferredLocale, sourceApp, acceptLanguage });
  res.json(enrichLeadWithLocale(lead, req.headers['accept-language'] as string | undefined));
});
app.put('/api/leads/:id/locale', (req, res) => {
  const { locale } = req.body;
  const lead = setLeadLocale(req.params.id, locale ?? null);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(enrichLeadWithLocale(lead, req.headers['accept-language'] as string | undefined));
});
app.post('/api/leads/:id/generate-demo', (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  const accountLocale = resolveRequestLocale(acceptLanguage);
  const { locale, source } = resolveLeadLocale(lead.id, { acceptLanguage, accountLocale });
  const basePrompt = req.body.prompt || `Generate localized outreach content for ${lead.name}.`;
  const prompt = buildLeadLocalizedPrompt(
    { leadId: lead.id, sourceApp: lead.sourceApp, acceptLanguage, accountLocale },
    basePrompt,
  );
  res.json({ leadId: lead.id, locale, source, prompt, sourceApp: lead.sourceApp });
});

// Stats & dashboard
app.get('/api/stats', (_req, res) => res.json(getStats()));
app.get('/api/activity', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(getActivity(limit));
});

// Products
app.get('/api/products', (req, res) => {
  const productType = req.query.type as string | undefined;
  const brand = req.query.brand as string | undefined;
  res.json(getProducts({ productType, brand }));
});
app.get('/api/tools/sgos', (_req, res) => res.json(getNotionInventorySummary()));

// Notion / Kimi3 tools inventory — completely separate from Money Autopilot products
app.get('/api/notion-tools', (_req, res) => res.json(getNotionTools()));
app.get('/api/notion-tools/inventory', (_req, res) => res.json(getNotionInventorySummary()));
app.post('/api/notion-tools', (req, res) => {
  const { name, description, category, sellPrice, cost, stock, notionUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const tool = addNotionTool({
    id: uuidv4(),
    name,
    description,
    category,
    sellPrice: sellPrice != null ? Number(sellPrice) : null,
    cost: cost != null ? Number(cost) : null,
    stock: stock != null ? Number(stock) : 0,
    notionUrl,
  });
  res.json(tool);
});
app.put('/api/notion-tools/:id', (req, res) => {
  const tool = updateNotionTool(req.params.id, req.body);
  if (!tool) return res.status(404).json({ error: 'Not found' });
  res.json(tool);
});
app.delete('/api/notion-tools/:id', (req, res) => {
  deleteNotionTool(req.params.id);
  res.json({ ok: true });
});
app.post('/api/notion-tools/import', (req, res) => {
  const { names } = req.body;
  if (!Array.isArray(names)) return res.status(400).json({ error: 'names array required' });
  const imported = importNotionTools(names);
  res.json({ imported: imported.length, tools: imported });
});
app.post('/api/notion-tools/seed-catalog', (req, res) => {
  const force = !!req.body.force;
  const result = seedNotionCatalog(force);
  res.json({ ...result, catalog: NOTION_CATALOG_STATS, inventory: getNotionInventorySummary() });
});
app.get('/api/notion-tools/catalog-info', (_req, res) => {
  res.json({ ...NOTION_CATALOG_STATS, inventory: getNotionInventorySummary() });
});
app.post('/api/notion-tools/:id/sell', (req, res) => {
  const tool = getNotionTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (tool.sellPrice == null) return res.status(400).json({ error: 'No price set for this tool yet' });
  const qty = Number(req.body.quantity) || 1;
  const revenue = tool.sellPrice * qty;
  const profit = ((tool.sellPrice ?? 0) - (tool.cost ?? 0)) * qty;
  const sale = addSale({ id: uuidv4(), productId: req.params.id, quantity: qty, revenue, profit });
  recordNotionToolSale(req.params.id, qty);
  res.json(sale);
});
app.get('/api/products/top', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 5;
  res.json(getTopProducts(limit));
});
app.get('/api/products/:id', (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});
app.post('/api/products', (req, res) => {
  const { name, cost, sellPrice, category, affiliateLink, imageUrl, productType, brand, stock, description } = req.body;
  if (!name || cost == null || sellPrice == null) {
    return res.status(400).json({ error: 'name, cost, sellPrice required' });
  }
  const profit = sellPrice - cost;
  const viralScore = Math.min(99, Math.round(50 + (profit / Math.max(cost, 1)) * 10));
  const product = addProduct({
    id: uuidv4(),
    name,
    cost: Number(cost),
    sellPrice: Number(sellPrice),
    category: category || 'general',
    productType: productType || 'product',
    brand: brand || 'other',
    stock: stock != null ? Number(stock) : 0,
    description,
    source: 'manual',
    viralScore,
    affiliateLink,
    imageUrl,
  });
  res.json(product);
});
app.put('/api/products/:id', (req, res) => {
  const product = updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});
app.delete('/api/products/:id', (req, res) => {
  deleteProduct(req.params.id);
  res.json({ ok: true });
});

// Sales
app.get('/api/sales', (_req, res) => res.json(getSales()));
app.post('/api/sales', (req, res) => {
  const { productId, quantity } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const qty = Number(quantity) || 1;
  const revenue = product.sellPrice * qty;
  const profit = (product.sellPrice - product.cost) * qty;
  const sale = addSale({ id: uuidv4(), productId, quantity: qty, revenue, profit });
  res.json(sale);
});

// Expenses
app.get('/api/expenses', (_req, res) => res.json(getExpenses()));
app.post('/api/expenses', (req, res) => {
  const { description, amount } = req.body;
  if (!description || amount == null) return res.status(400).json({ error: 'description, amount required' });
  const expense = addExpense({ id: uuidv4(), description, amount: Number(amount) });
  res.json(expense);
});

// Content generation
app.get('/api/content', (_req, res) => res.json(getContent()));
app.post('/api/content/generate', async (req, res) => {
  const { productId, platforms, locale } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const plats = platforms || ['tiktok', 'instagram', 'twitter'];
  const resolvedLocale = resolveRequestLocale(req.headers['accept-language'] as string | undefined, locale);
  const saved = generateAndSaveContent(product, plats, resolvedLocale);
  res.json(saved);
});
app.post('/api/content/preview', (req, res) => {
  const { productId, platforms, locale } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const plats = platforms || ['tiktok', 'instagram', 'twitter'];
  const resolvedLocale = resolveRequestLocale(req.headers['accept-language'] as string | undefined, locale);
  res.json(generateContentForProduct(product, plats, resolvedLocale));
});
app.post('/api/content/generate-ai', async (req, res) => {
  const { productId, platform, locale } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const resolvedLocale = resolveRequestLocale(req.headers['accept-language'] as string | undefined, locale);
  const aiPost = await generateWithAI(product, platform || 'tiktok', resolvedLocale);
  if (!aiPost) {
    const fallback = generateContentForProduct(product, [platform || 'tiktok'], resolvedLocale);
    return res.json(fallback[0]);
  }
  const saved = addContent({ ...aiPost, status: 'draft' });
  res.json(saved);
});

// Social posting
app.post('/api/post/publish', async (_req, res) => {
  const results = await publishQueuedPosts(5);
  res.json(results);
});
app.get('/api/post/status', (_req, res) => res.json(getSocialStatus()));

// Product discovery
app.post('/api/discover', async (req, res) => {
  const settings = getAutopilotSettings();
  const niche = req.body.niche || settings.niche;
  const limit = req.body.limit || 5;
  const discovered = await discoverTopProducts(niche, limit);
  res.json(discovered);
});

// Autopilot control
app.get('/api/autopilot/status', (_req, res) => res.json(getAutopilotStatus()));
app.get('/api/autopilot/settings', (_req, res) => res.json(getAutopilotSettings()));
app.put('/api/autopilot/settings', (req, res) => {
  saveAutopilotSettings(req.body);
  stopAutopilotScheduler();
  startAutopilotScheduler();
  res.json(getAutopilotSettings());
});
app.post('/api/autopilot/run', async (_req, res) => {
  try {
    const result = await runAutopilotCycle();
    res.json(result);
  } catch (e) {
    res.status(409).json({ error: String(e) });
  }
});
app.post('/api/autopilot/start', (_req, res) => {
  const settings = getAutopilotSettings();
  settings.enabled = true;
  saveAutopilotSettings(settings);
  startAutopilotScheduler();
  res.json(getAutopilotStatus());
});
app.post('/api/autopilot/stop', (_req, res) => {
  const settings = getAutopilotSettings();
  settings.enabled = false;
  saveAutopilotSettings(settings);
  stopAutopilotScheduler();
  res.json(getAutopilotStatus());
});

// Daily Factory — 5 apps + 5 proposals per day
app.get('/api/factory/themes', (_req, res) => {
  res.json({ themes: FACTORY_THEMES, suggestedToday: getThemeForDay() });
});
app.get('/api/factory/runs', (_req, res) => res.json(getFactoryRuns()));
app.get('/api/factory/runs/:id', (req, res) => {
  const run = getFactoryRun(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
});
app.post('/api/factory/run', (req, res) => {
  const theme = req.body.theme;
  const run = generateDailyRun(theme);
  res.json(run);
});
app.post('/api/factory/run-three', (_req, res) => {
  const run = generateThreeThemePackage();
  res.json(run);
});
app.post('/api/factory/run-five', (_req, res) => {
  const run = generateFiveThemePackage();
  res.json(run);
});
app.post('/api/factory/run-multi', (req, res) => {
  const themes = req.body.themes as string[] | undefined;
  const suffix = req.body.folderSuffix as string | undefined;
  if (!themes?.length) {
    return res.status(400).json({ error: 'themes array required' });
  }
  const run = generateMultiThemeRun(themes as import('./factory/themes.js').FactoryTheme[], suffix);
  res.json(run);
});
app.get('/api/factory/multi-runs', (_req, res) => res.json(getMultiThemeRuns()));
app.get('/api/factory/multi-runs/:id', (req, res) => {
  const run = getMultiThemeRun(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
});
app.get('/api/factory/output-root', (_req, res) => res.json({ path: OUTPUT_ROOT }));
app.post('/api/factory/expand-proposals', (_req, res) => {
  const results = expandAllOutputFolders();
  res.json({ results, totalExpanded: results.reduce((s, r) => s + r.expandedSingles + r.expandedSuites, 0) });
});
app.post('/api/factory/multilingual-package', (_req, res) => {
  const result = writeMultilingualPackage();
  res.json({ ok: true, outputRoot: OUTPUT_ROOT, ...result });
});

// Serve frontend in production
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ message: 'Money Autopilot API running' });
  });
});

app.listen(PORT, () => {
  console.log(`💰 Money Autopilot server running on http://localhost:${PORT}`);
  startAutopilotScheduler();
});

export default app;
