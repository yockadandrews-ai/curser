/**
 * Sovereign Sales Autopilot — active vertical + pricing (founder-set)
 */

import path from 'path';
import type { SovereignVerticalConfig, SovereignVerticalId } from './schemas.js';

const DATA_ROOT = path.join(process.cwd(), 'server', 'data', 'sovereign');

export const SOVEREIGN_ACTIVE_VERTICAL: SovereignVerticalId = 'solar';

export const SOVEREIGN_PRICING = {
  entryUsd: 15_000,
  enterpriseUsd: 25_000,
  depositPct: 50,
} as const;

export const VERTICALS: Record<SovereignVerticalId, SovereignVerticalConfig> = {
  solar: {
    id: 'solar',
    label: 'Solar',
    active: true,
    painPointDefault: 'Leads die after 5pm — no one answers until morning',
    crmIntegrations: ['HubSpot', 'Salesforce', 'GoHighLevel'],
    calendarIntegrations: ['Calendly', 'Acuity', 'Google Calendar'],
    qualifyKeywords: ['solar', 'installer', 'panel', 'roof', 'pv', 'renewable', 'energy'],
    pricing: [
      {
        id: 'entry',
        label: 'Solar AI Agent — Entry',
        priceUsd: SOVEREIGN_PRICING.entryUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_solar_entry_15k',
      },
      {
        id: 'enterprise',
        label: 'Solar AI Agent — Enterprise',
        priceUsd: SOVEREIGN_PRICING.enterpriseUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_solar_enterprise_25k',
      },
    ],
    k3TemplatePath: path.join(DATA_ROOT, 'solar', 'k3-template.json'),
    lingDemoScriptPath: path.join(DATA_ROOT, 'solar', 'ling-demo-script.md'),
    sg3CalendarPath: path.join(DATA_ROOT, 'solar', 'sg3-content-calendar.json'),
  },
  dental: {
    id: 'dental',
    label: 'Dental',
    active: false,
    painPointDefault: 'Front desk overwhelmed — missed new patient calls',
    crmIntegrations: ['Dentrix', 'Open Dental', 'HubSpot'],
    calendarIntegrations: ['Calendly', 'LocalMed'],
    qualifyKeywords: ['dental', 'dentist', 'orthodont', 'hygiene', 'patient'],
    pricing: [
      {
        id: 'entry',
        label: 'Dental AI Agent — Entry',
        priceUsd: SOVEREIGN_PRICING.entryUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_dental_entry_15k',
      },
      {
        id: 'enterprise',
        label: 'Dental AI Agent — Enterprise',
        priceUsd: SOVEREIGN_PRICING.enterpriseUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_dental_enterprise_25k',
      },
    ],
    k3TemplatePath: path.join(DATA_ROOT, 'dental', 'k3-template.json'),
    lingDemoScriptPath: path.join(DATA_ROOT, 'dental', 'ling-demo-script.md'),
    sg3CalendarPath: path.join(DATA_ROOT, 'dental', 'sg3-content-calendar.json'),
  },
  legal: {
    id: 'legal',
    label: 'Legal',
    active: false,
    painPointDefault: 'Intake backlog — high-value cases wait 48+ hours',
    crmIntegrations: ['Clio', 'MyCase', 'HubSpot'],
    calendarIntegrations: ['Calendly', 'Lawmatics'],
    qualifyKeywords: ['law', 'attorney', 'legal', 'firm', 'litigation', 'injury'],
    pricing: [
      {
        id: 'entry',
        label: 'Legal AI Agent — Entry',
        priceUsd: SOVEREIGN_PRICING.entryUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_legal_entry_15k',
      },
      {
        id: 'enterprise',
        label: 'Legal AI Agent — Enterprise',
        priceUsd: SOVEREIGN_PRICING.enterpriseUsd,
        depositPct: SOVEREIGN_PRICING.depositPct,
        stripeProductHint: 'price_legal_enterprise_25k',
      },
    ],
    k3TemplatePath: path.join(DATA_ROOT, 'legal', 'k3-template.json'),
    lingDemoScriptPath: path.join(DATA_ROOT, 'legal', 'ling-demo-script.md'),
    sg3CalendarPath: path.join(DATA_ROOT, 'legal', 'sg3-content-calendar.json'),
  },
};

export function getActiveVertical(): SovereignVerticalConfig {
  return VERTICALS[SOVEREIGN_ACTIVE_VERTICAL];
}

export function getVertical(id: SovereignVerticalId): SovereignVerticalConfig {
  return VERTICALS[id];
}
