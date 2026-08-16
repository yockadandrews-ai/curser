import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
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
  seedNotionCatalog, syncCatalogPrices, addNotionToolSaleRecord, getNotionToolSales,
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
import {
  getProposalStatusReport,
  generateTodayProposalBatch,
  getApprovalQueue,
  approveDraft,
  rejectDraft,
  markDraftSent,
  syncDraftsFromDisk,
  getPendingDrafts,
  getPendingDraftCount,
} from './shortcuts/proposalStatus.js';
import {
  getCommandConfig,
  captureSignal,
  getGovernanceStatus,
  getMetricsPulse,
  logTeslaDrivePrep,
  COMMAND_MENU,
} from './shortcuts/sgosCommand.js';
import {
  buildDailyReminderIcs,
  buildBatchReviewIcs,
  getApprovalCalendarLinks,
  getBatchGoogleCalendarUrl,
} from './shortcuts/calendar.js';
import {
  getHermesState,
  getHermesTasks,
  getHermesTask,
  ingestHermesSignal,
  founderDecision,
  simulateCalendarTrigger,
  getLedgerForTask,
} from './hermes/orchestrator.js';
import {
  generateContentCalendarPlan,
  buildContentCalendarIcs,
  getContentCalendarGoogleLinks,
} from './hermes/contentCalendar.js';
import { getLedgerRows } from './hermes/chaosLedger.js';
import { triggerFromCalendarEvent } from './hermes/calendarTrigger.js';
import { getN8nHermesConfig, verifyN8nSecret } from './hermes/n8nConfig.js';
import { getRegistryJson } from './data/productRegistry.js';
import { LIVE_CALENDAR_EVENTS, listUpcomingLiveEvents, buildLiveCalendarIcs } from './data/liveCalendarEvents.js';
import { CONTENT_FACTORY_TASK_SCHEMA, HERMES_HANDOFF_RULES } from './schemas/contentFactoryTask.js';
import { seedSprint2VaultIfMissing, seedAllSprintVaults } from './hermes/contentFactory.js';
import { NOTION_BRIEF_TEMPLATES, getNotionBriefTemplate } from './data/notionBriefTemplates.js';
import {
  buildExportCsv,
  importCsv,
  getProductPerformance,
  getProfitGoal,
  setProfitGoal,
  computeMonthlyProfit,
  checkGoalMilestones,
  seedDemoData,
  recordExternalRevenue,
} from './profitTracker.js';
import {
  getLoopState,
  getSovereignConfig,
  getTickets,
  getTicket,
  getEmissions,
  ingestInbound,
  submitQualifyAnswers,
  handleLingReply,
  recordSignature,
  updateDeploymentMetrics,
  runFakeLeadTest,
  generateWeeklyEmissions,
  buildLingDemoPackage,
  loadK3Template,
} from './sovereign/loop.js';
import { HERMES_QUALIFY_QUESTIONS } from './sovereign/hermesGate.js';
import { getActiveVertical } from './sovereign/config.js';
import {
  subscribeOutreach,
  dispatchOutreachWebhook,
  getWelcomeSequenceForAutomation,
  getRecentOutreachEvents,
  buildApproveUrl,
  getAppBaseUrl,
} from './outreach.js';
import {
  createEngineCheckoutSession,
  getCheckoutSessionStatus,
  isStripeConfigured,
  getStripePublishableKey,
  ENGINE_PRODUCT,
} from './checkout.js';
import { registerUnifiedStripeWebhook } from './stripeWebhookRouter.js';
import { register33333Routes } from './33333/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Remove SGOS tools that were incorrectly mixed into affiliate products
const removed = cleanupMixedSgosProducts(db);
if (removed > 0) console.log(`[Cleanup] Removed ${removed} SGOS tools from affiliate products (now separate)`);

const pricesSynced = syncCatalogPrices();
if (pricesSynced > 0) console.log(`[Catalog] Synced ${pricesSynced} Notion tool prices`);

const draftsSynced = syncDraftsFromDisk();
if (draftsSynced > 0) console.log(`[SGOS] Synced ${draftsSynced} proposal draft(s) from output/`);

app.use(cors());

// Stripe webhook — raw body required; dispatches to outreach / 33333 / sovereign lanes
registerUnifiedStripeWebhook(app);

app.use(express.json());

// Outreach — welcome sequence signup + automation hooks
app.get('/api/outreach/welcome-sequence', (_req, res) => {
  res.json({ steps: getWelcomeSequenceForAutomation() });
});
app.get('/api/outreach/events', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(getRecentOutreachEvents(limit));
});
app.post('/api/outreach/subscribe', async (req, res) => {
  const { email, name, source } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const subscriber = subscribeOutreach({ email, name, source: source || 'landing' });
    await dispatchOutreachWebhook({
      type: 'subscribe',
      email: subscriber.email,
      name: subscriber.name,
      subscriberId: subscriber.id,
      approveUrl: buildApproveUrl(),
      dashboardUrl: getAppBaseUrl(),
      timestamp: new Date().toISOString(),
    });
    res.json({ ok: true, subscriber });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

// Stripe checkout — Money Autopilot Engine ($197)
app.get('/api/checkout/config', (_req, res) => {
  res.json({
    configured: isStripeConfigured(),
    publishableKey: getStripePublishableKey(),
    product: ENGINE_PRODUCT,
    approveUrl: buildApproveUrl(),
    dashboardUrl: getAppBaseUrl(),
  });
});
app.post('/api/checkout/engine', async (req, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({
      error: 'Stripe not configured',
      hint: 'Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env',
    });
  }
  try {
    const { email, customerName } = req.body;
    const session = await createEngineCheckoutSession({ email, customerName });
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.get('/api/checkout/session/:sessionId', async (req, res) => {
  try {
    const status = await getCheckoutSessionStatus(req.params.sessionId);
    res.json(status);
  } catch (e) {
    res.status(404).json({ error: String(e) });
  }
});

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
app.post('/api/notion-tools/sync-prices', (_req, res) => {
  const pricesSynced = syncCatalogPrices();
  res.json({ pricesSynced, inventory: getNotionInventorySummary() });
});
app.get('/api/notion-tools/sales', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(getNotionToolSales(limit));
});
app.get('/api/notion-tools/catalog-info', (_req, res) => {
  res.json({ ...NOTION_CATALOG_STATS, inventory: getNotionInventorySummary() });
});
app.post('/api/notion-tools/:id/sell', (req, res) => {
  const tool = getNotionTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (tool.sellPrice == null) {
    return res.status(400).json({
      error: 'No price set for this tool yet',
      hint: 'Run POST /api/notion-tools/sync-prices or set a price in Notion Tools',
    });
  }
  const qty = Number(req.body.quantity) || 1;
  const previousMonthly = computeMonthlyProfit();
  const result = addNotionToolSaleRecord(req.params.id, qty);
  if (!result) return res.status(500).json({ error: 'Failed to record sale' });
  const newMonthly = computeMonthlyProfit();
  const goalAlert = checkGoalMilestones(previousMonthly, newMonthly);
  res.json({ ...result, goalAlert: goalAlert ?? undefined });
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

// Sales — affiliate products only (Notion tool sales use /api/notion-tools/:id/sell)
app.get('/api/sales', (_req, res) => {
  const productSales = getSales().map(s => ({ ...s, saleType: 'product' as const }));
  const toolSales = getNotionToolSales(100).map(s => ({
    id: s.id,
    productId: s.notionToolId,
    quantity: s.quantity,
    revenue: s.revenue,
    profit: s.profit,
    createdAt: s.createdAt,
    saleType: 'notion_tool' as const,
    itemName: s.toolName,
  }));
  res.json([...productSales, ...toolSales].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});
app.post('/api/sales', (req, res) => {
  const { productId, quantity } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const qty = Number(quantity) || 1;
  const revenue = product.sellPrice * qty;
  const profit = (product.sellPrice - product.cost) * qty;
  const previousMonthly = computeMonthlyProfit();
  const sale = addSale({ id: uuidv4(), productId, quantity: qty, revenue, profit });
  const newMonthly = computeMonthlyProfit();
  const goalAlert = checkGoalMilestones(previousMonthly, newMonthly);
  res.json({ sale, goalAlert: goalAlert ?? undefined });
});

// Expenses
app.get('/api/expenses', (_req, res) => res.json(getExpenses()));
app.post('/api/expenses', (req, res) => {
  const { description, amount } = req.body;
  if (!description || amount == null) return res.status(400).json({ error: 'description, amount required' });
  const expense = addExpense({ id: uuidv4(), description, amount: Number(amount) });
  res.json(expense);
});

// Profit Tracker — export/import CSV, product performance, monthly goal
app.get('/api/profit-tracker/export.csv', (_req, res) => {
  const date = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="money-magnet-export-${date}.csv"`);
  res.send(buildExportCsv());
});
app.post('/api/profit-tracker/import', (req, res) => {
  const { csv, mode } = req.body as { csv?: string; mode?: 'merge' | 'replace' };
  if (!csv?.trim()) return res.status(400).json({ error: 'csv content required' });
  try {
    res.json(importCsv(csv, mode === 'replace' ? 'replace' : 'merge'));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.get('/api/profit-tracker/product-performance', (_req, res) => {
  res.json(getProductPerformance());
});
app.get('/api/profit-tracker/goal', (_req, res) => {
  const goal = getProfitGoal();
  res.json({ ...goal, monthlyProfit: computeMonthlyProfit() });
});
app.put('/api/profit-tracker/goal', (req, res) => {
  const { monthlyGoal } = req.body;
  if (monthlyGoal == null) return res.status(400).json({ error: 'monthlyGoal required' });
  res.json({ ...setProfitGoal(Number(monthlyGoal)), monthlyProfit: computeMonthlyProfit() });
});
app.post('/api/profit-tracker/demo-data', (_req, res) => {
  res.json(seedDemoData());
});
app.post('/api/profit-tracker/record-revenue', (req, res) => {
  const { source, amount, description, cost } = req.body;
  if (amount == null || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount required (positive number)' });
  }
  const result = recordExternalRevenue({ source, amount: Number(amount), description, cost: cost != null ? Number(cost) : 0 });
  res.json({
    ok: true,
    ...result,
    message: `Recorded $${result.profit.toFixed(2)} profit from ${result.productName}`,
  });
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

// Shortcuts Hub — SGOS Autopilot Proposal Status (draft free, send gated)
app.get('/api/shortcuts/proposal-status', (_req, res) => {
  res.json(getProposalStatusReport());
});
app.post('/api/shortcuts/generate-today', (_req, res) => {
  try {
    const result = generateTodayProposalBatch();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.get('/api/shortcuts/approval-queue', (_req, res) => {
  res.json(getApprovalQueue());
});
app.post('/api/shortcuts/approve/:id', (req, res) => {
  const draft = approveDraft(req.params.id, req.body.approvedBy || 'human');
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.json({ draft, sent: 0, note: 'Approved — still Sent=0 until manual send + proof URL' });
});
app.post('/api/shortcuts/reject/:id', (req, res) => {
  const draft = rejectDraft(req.params.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.json(draft);
});
app.post('/api/shortcuts/mark-sent/:id', (req, res) => {
  const { proofUrl } = req.body;
  if (!proofUrl) return res.status(400).json({ error: 'proofUrl required — cannot increment Sent without L5 proof' });
  const draft = markDraftSent(req.params.id, proofUrl);
  if (!draft) return res.status(400).json({ error: 'Draft must be APPROVED before marking sent with proof' });
  res.json(draft);
});
app.get('/api/shortcuts/pending', (_req, res) => {
  res.json({ count: getPendingDraftCount(), drafts: getPendingDrafts() });
});
app.get('/api/shortcuts/calendar/links', (_req, res) => {
  res.json(getApprovalCalendarLinks());
});
app.get('/api/shortcuts/calendar/daily.ics', (_req, res) => {
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sgos-daily-approval-reminder.ics"');
  res.send(buildDailyReminderIcs());
});
app.get('/api/shortcuts/calendar/batch/:id.ics', (req, res) => {
  const draft = getPendingDrafts().find(d => d.id === req.params.id)
    ?? getApprovalQueue().find(d => d.id === req.params.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sgos-review-${draft.batchDate}.ics"`);
  res.send(buildBatchReviewIcs(draft));
});
app.get('/api/shortcuts/calendar/batch/:id/google', (req, res) => {
  const draft = getPendingDrafts().find(d => d.id === req.params.id)
    ?? getApprovalQueue().find(d => d.id === req.params.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.redirect(getBatchGoogleCalendarUrl(draft));
});

// SGOS Command — protected shortcuts (confirm → action → notify; never auto-send)
app.get('/api/command/config', (_req, res) => {
  res.json({ config: getCommandConfig(), menu: COMMAND_MENU });
});
app.post('/api/command/capture-signal', (req, res) => {
  const { signal, parties, priority } = req.body;
  if (!signal?.trim()) return res.status(400).json({ error: 'signal required' });
  res.json(captureSignal({ signal, parties, priority }));
});
app.get('/api/command/governance-status', (_req, res) => {
  res.json(getGovernanceStatus());
});
app.get('/api/command/metrics-pulse', (_req, res) => {
  res.json(getMetricsPulse());
});
app.post('/api/command/tesla-drive-prep', (req, res) => {
  res.json(logTeslaDrivePrep(Boolean(req.body.sentryEnabled)));
});

// Hermes Supervisor — orchestration (draft free, publish gated, Chaos Ledger attribution)
app.get('/api/hermes/dashboard', (_req, res) => {
  res.json({
    state: getHermesState(),
    tasks: getHermesTasks(30),
    ledger: getLedgerRows(20),
    briefs: NOTION_BRIEF_TEMPLATES,
    calendar: { live: LIVE_CALENDAR_EVENTS, upcoming: listUpcomingLiveEvents() },
    registry: getRegistryJson(),
    schema: CONTENT_FACTORY_TASK_SCHEMA,
    handoffRules: HERMES_HANDOFF_RULES,
    n8n: getN8nHermesConfig(),
  });
});
app.get('/api/hermes/status', (_req, res) => {
  res.json(getHermesState());
});
app.get('/api/hermes/tasks', (_req, res) => {
  res.json(getHermesTasks(100));
});
app.get('/api/hermes/tasks/:id', (req, res) => {
  const task = getHermesTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ task, ledger: getLedgerForTask(task.id) });
});
app.post('/api/hermes/ingest', (req, res) => {
  const { source, title, summary, productSlug, platform, amount, payload } = req.body;
  if (!source || !title) return res.status(400).json({ error: 'source and title required' });
  try {
    const task = ingestHermesSignal({
      source,
      title,
      summary,
      productSlug,
      platform,
      payload: amount != null ? { ...(payload || {}), amount, source: source === 'gumroad_sale' ? 'Gumroad' : source } : payload,
    });
    res.json({ task });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.post('/api/hermes/tasks/:id/decision', (req, res) => {
  const { decision, notes, proofUrl, approvedBy } = req.body;
  if (!decision) return res.status(400).json({ error: 'decision required: approve | reject | modify' });
  try {
    const result = founderDecision({
      taskId: req.params.id,
      decision,
      notes,
      proofUrl,
      approvedBy,
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.post('/api/hermes/simulate-calendar', (req, res) => {
  const { eventType, productSlug } = req.body;
  if (!eventType || !productSlug) return res.status(400).json({ error: 'eventType and productSlug required' });
  const task = simulateCalendarTrigger(eventType, productSlug);
  res.json({ task });
});
app.get('/api/hermes/calendar/plan', (req, res) => {
  const startFromSlug = typeof req.query.from === 'string' ? req.query.from : 'gas-station';
  res.json(generateContentCalendarPlan({ startFromSlug }));
});
app.get('/api/hermes/calendar/content.ics', (_req, res) => {
  const plan = generateContentCalendarPlan({ startFromSlug: 'gas-station' });
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sgos-content-factory.ics"');
  res.send(buildContentCalendarIcs(plan));
});
app.get('/api/hermes/calendar/google-links', (_req, res) => {
  const plan = generateContentCalendarPlan({ startFromSlug: 'gas-station' });
  res.json(getContentCalendarGoogleLinks(plan));
});
app.get('/api/hermes/briefs', (_req, res) => {
  res.json(NOTION_BRIEF_TEMPLATES);
});
app.get('/api/hermes/briefs/:id', (req, res) => {
  const template = getNotionBriefTemplate(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});
app.get('/api/hermes/ledger', (_req, res) => {
  res.json(getLedgerRows(100));
});
app.get('/api/hermes/registry', (_req, res) => {
  res.json(getRegistryJson());
});
app.get('/api/hermes/schema/content-factory', (_req, res) => {
  res.json({ schema: CONTENT_FACTORY_TASK_SCHEMA, handoffRules: HERMES_HANDOFF_RULES });
});
app.get('/api/hermes/calendar/live', (_req, res) => {
  res.json({ events: LIVE_CALENDAR_EVENTS, upcoming: listUpcomingLiveEvents() });
});
app.post('/api/hermes/calendar/trigger', (req, res) => {
  if (!verifyN8nSecret(req.headers['x-hermes-secret'] as string | undefined)) {
    return res.status(401).json({ error: 'Invalid X-Hermes-Secret' });
  }
  const { title, startDate, productId, eventType, source, force } = req.body;
  if (!title && !productId) return res.status(400).json({ error: 'title or productId required' });
  try {
    const result = triggerFromCalendarEvent({
      title: title || '',
      startDate,
      productId,
      eventType,
      source: source || 'n8n',
      force: Boolean(force),
    });
    res.status(result.matched ? 200 : 404).json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.get('/api/hermes/n8n/config', (_req, res) => {
  res.json(getN8nHermesConfig());
});
app.post('/api/hermes/n8n/test', (req, res) => {
  if (!verifyN8nSecret(req.headers['x-hermes-secret'] as string | undefined)) {
    return res.status(401).json({ error: 'Invalid X-Hermes-Secret' });
  }
  const result = triggerFromCalendarEvent({
    title: req.body.title || 'SGOS Sprint 2 Build — Gas Station Snack Rankings',
    startDate: req.body.startDate || '2026-08-16',
    source: 'n8n',
    force: Boolean(req.body.force),
  });
  res.json({ ok: result.matched, ...result, config: getN8nHermesConfig() });
});
app.get('/api/hermes/calendar/live.ics', (_req, res) => {
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sgos-live-sprints-2-8-bundle.ics"');
  res.send(buildLiveCalendarIcs());
});
app.post('/api/hermes/seed/all-sprints', (_req, res) => {
  try {
    res.json(seedAllSprintVaults());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.post('/api/hermes/seed/sprint-2', (_req, res) => {
  try {
    res.json(seedSprint2VaultIfMissing());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});


// Sovereign Sales Autopilot — SG3 → Hermes → Ling → K3
app.get('/api/sovereign/dashboard', (_req, res) => {
  res.json({
    config: getSovereignConfig(),
    state: getLoopState(),
    vertical: getActiveVertical(),
    qualifyQuestions: HERMES_QUALIFY_QUESTIONS,
    tickets: getTickets(20),
    emissions: getEmissions(10),
  });
});
app.get('/api/sovereign/config', (_req, res) => {
  res.json(getSovereignConfig());
});
app.get('/api/sovereign/state', (_req, res) => {
  res.json(getLoopState());
});
app.get('/api/sovereign/tickets', (_req, res) => {
  res.json(getTickets(100));
});
app.get('/api/sovereign/tickets/:id', (req, res) => {
  const ticket = getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});
app.post('/api/sovereign/inbound', (req, res) => {
  const { channel, name, email, company, message, vertical } = req.body;
  if (!channel || !name) return res.status(400).json({ error: 'channel and name required' });
  try {
    res.json(ingestInbound({ channel, name, email, company, message, vertical }));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.post('/api/sovereign/tickets/:id/qualify', (req, res) => {
  try {
    res.json(submitQualifyAnswers(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.post('/api/sovereign/tickets/:id/reply', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    res.json(handleLingReply(req.params.id, message));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.post('/api/sovereign/tickets/:id/sign', (req, res) => {
  try {
    res.json(recordSignature(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.post('/api/sovereign/deployments/:id/metrics', (req, res) => {
  try {
    res.json(updateDeploymentMetrics(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
app.get('/api/sovereign/k3/template', (_req, res) => {
  try {
    res.json(loadK3Template(getActiveVertical().id));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.get('/api/sovereign/sg3/emissions', (_req, res) => {
  res.json(generateWeeklyEmissions(getActiveVertical().id));
});
app.post('/api/sovereign/test/fake-lead', (_req, res) => {
  try {
    res.json(runFakeLeadTest());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// 33333 Autopilot Revenue — consumer lane (separate from SGOS/Hermes/Sovereign)
register33333Routes(app);

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
