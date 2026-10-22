/**
 * Unified sales / revenue command center — all lanes in one snapshot.
 */

import { getStats, getActivity, db } from './db.js';
import { computeMonthlyProfit } from './profitTracker.js';
import { getLoopState, getTickets, getEmissions } from './sovereign/loop.js';
import { getActiveVertical, SOVEREIGN_PRICING } from './sovereign/config.js';
import { get33333DashboardStats, getRevenueEvents, getBrandLeads } from './33333/db.js';
import { countConfiguredStripeLinks } from './33333/stripeLinks.js';
import { getConvertKitConfig } from './33333/convertkit.js';
import { determineElementBlock, getBackgroundOpsFlags } from './33333/bridge.js';
import { getRecentOutreachEvents } from './outreach.js';
import { isStripeConfigured, ENGINE_PRODUCT } from './checkout.js';

export interface EnvReadiness {
  stripeSecret: boolean;
  stripeWebhook: boolean;
  stripeEngineCheckout: boolean;
  sovereignSolarEntry: boolean;
  outreachWebhook: boolean;
  n33333Secret: boolean;
  convertkit: boolean;
  gemini: boolean;
  stripeLinksConfigured: number;
  stripeLinksTotal: number;
}

export interface DeployChecklistItem {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
}

function envReady(): EnvReadiness {
  const stripeLinksConfigured = countConfiguredStripeLinks();
  return {
    stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    stripeEngineCheckout: isStripeConfigured(),
    sovereignSolarEntry: Boolean(process.env.STRIPE_SOLAR_ENTRY_CHECKOUT_URL?.trim()),
    outreachWebhook: Boolean(process.env.OUTREACH_WEBHOOK_URL?.trim()),
    n33333Secret: Boolean(process.env.N33333_WEBHOOK_SECRET?.trim()),
    convertkit: getConvertKitConfig().configured,
    gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
    stripeLinksConfigured,
    stripeLinksTotal: 15,
  };
}

function countOutreachSubscribers(): number {
  try {
    const row = db.prepare('SELECT COUNT(*) as c FROM outreach_subscribers').get() as { c: number };
    return row.c;
  } catch {
    return 0;
  }
}

function buildDeployChecklist(env: EnvReadiness): DeployChecklistItem[] {
  return [
    {
      id: 'stripe-core',
      label: 'Stripe keys + webhook secret',
      done: env.stripeSecret && env.stripeWebhook,
      hint: 'STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET',
    },
    {
      id: 'engine-197',
      label: 'Outreach Engine ($197) checkout live',
      done: env.stripeEngineCheckout,
      hint: 'STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY',
    },
    {
      id: 'sovereign-solar',
      label: 'Sovereign Solar deposit link',
      done: env.sovereignSolarEntry,
      hint: 'STRIPE_SOLAR_ENTRY_CHECKOUT_URL',
    },
    {
      id: '33333-links',
      label: '33333 Payment Links configured',
      done: env.stripeLinksConfigured >= 3,
      hint: `${env.stripeLinksConfigured}/${env.stripeLinksTotal} STRIPE_LINK_* set`,
    },
    {
      id: 'n8n-bridge',
      label: 'n8n BRIDGE_33333 imported + active',
      done: env.n33333Secret && env.gemini,
      hint: 'Import docs/n8n/bridge-33333.workflow.json',
    },
    {
      id: 'outreach-automation',
      label: 'Outreach welcome/sale automation',
      done: env.outreachWebhook,
      hint: 'OUTREACH_WEBHOOK_URL + outreach-welcome-sale workflow',
    },
    {
      id: 'convertkit',
      label: 'ConvertKit welcome sequences',
      done: env.convertkit,
      hint: 'CONVERTKIT_API_KEY + CONVERTKIT_FORM_*',
    },
  ];
}

export function getSalesCommandCenter() {
  const env = envReady();
  const sovereign = getLoopState();
  const vertical = getActiveVertical();
  const consumer = get33333DashboardStats();
  const profitMonthly = computeMonthlyProfit();
  const stats = getStats();
  const bridgeClock = determineElementBlock();
  const recent33333Revenue = getRevenueEvents(10);
  const recentLeads = getBrandLeads(10);
  const sovereignTickets = getTickets(10);
  const pendingEmissions = getEmissions(5).filter(e => e.sent === 0);
  const outreachEvents = getRecentOutreachEvents(10);

  const sovereignPipelineValueUsd =
    (sovereign.ticketsByStatus?.handed_to_ling ?? 0) * SOVEREIGN_PRICING.entryUsd +
    (sovereign.ticketsByStatus?.contract_sent ?? 0) * SOVEREIGN_PRICING.entryUsd +
    (sovereign.ticketsByStatus?.live ?? 0) * SOVEREIGN_PRICING.entryUsd;

  return {
    scannedAt: new Date().toISOString(),
    summary: {
      profitTrackerMonthlyUsd: profitMonthly,
      netProfitAllTimeUsd: stats.netProfit,
      consumerMtdRevenueUsd: consumer.mtdRevenueCents / 100,
      consumerMtdLeads: consumer.mtdLeads,
      consumerConversionRate: consumer.conversionRate,
      outreachSubscribers: countOutreachSubscribers(),
      sovereignTotalTickets: sovereign.totalTickets,
      sovereignLiveDeployments: sovereign.liveDeployments,
      sovereignPipelineValueUsd,
      engineProduct: ENGINE_PRODUCT,
    },
    lanes: {
      sovereign: {
        activeVertical: vertical.id,
        verticalLabel: vertical.label,
        pricing: SOVEREIGN_PRICING,
        state: sovereign,
        recentTickets: sovereignTickets,
        pendingSg3Emissions: pendingEmissions,
      },
      outreach: {
        subscribers: countOutreachSubscribers(),
        recentEvents: outreachEvents,
        enginePriceUsd: ENGINE_PRODUCT.priceCents / 100,
      },
      consumer33333: {
        stats: consumer,
        recentRevenue: recent33333Revenue,
        recentLeads,
      },
      profitTracker: {
        monthlyProfit: profitMonthly,
        stats,
        recentActivity: getActivity(15),
      },
    },
    bridge: {
      clock: bridgeClock,
      backgroundOps: getBackgroundOpsFlags(bridgeClock),
    },
    env,
    deployChecklist: buildDeployChecklist(env),
    deployChecklistComplete: buildDeployChecklist(env).filter(i => i.done).length,
    deployChecklistTotal: buildDeployChecklist(env).length,
    docs: {
      platformAlignment: 'docs/PLATFORM_ALIGNMENT.md',
      updates: 'docs/UPDATES.md',
      biolinkLaunch: 'docs/launch/BIOLINK_OPTIMIZER_LAUNCH.md',
      bridgeWiring: 'docs/N8N_BRIDGE_33333.md',
    },
    quickActions: [
      { label: 'Run fake Sovereign lead test', method: 'POST', path: '/api/sovereign/test/fake-lead' },
      { label: '33333 dashboard JSON', method: 'GET', path: '/api/33333/dashboard' },
      { label: 'Bridge clock', method: 'GET', path: '/api/33333/bridge/clock' },
      { label: 'Hermes dashboard', method: 'GET', path: '/api/hermes/dashboard' },
    ],
  };
}
