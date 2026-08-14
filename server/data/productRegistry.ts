/**
 * Live product registry — synced with primary Google Calendar (America/New_York)
 */

import { SPRINT_SCHEDULE, BUNDLE_DAY } from './sprintSchedule.js';

export type ProductStatus = 'queued' | 'building' | 'awaiting_approval' | 'live' | 'receipted' | 'archived';

export interface ProductRegistryEntry {
  id: string;
  slug: string;
  name: string;
  price: number;
  status: ProductStatus;
  buildWindow: string;
  launchDate: string;
  receiptDate?: string;
  reelTimesEt: [string, string, string];
  schemaNotes: string;
  schema: Record<string, unknown>;
  vaultFolder: string;
  sprintNumber: number;
}

export const PRODUCT_REGISTRY: ProductRegistryEntry[] = [
  {
    id: 'sprint-2-gas-station',
    slug: 'sprint-2-gas-station',
    name: 'Gas Station Snack Rankings',
    price: 9,
    status: 'queued',
    buildWindow: '2026-08-16/17',
    launchDate: '2026-08-19',
    receiptDate: '2026-08-21',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes:
      'Regional brackets, exclusivity + crunch + regional pride scoring, hot takes, blank ranking page, receipt footer',
    schema: {
      format: 'ranking_pdf',
      pages: ['cover', 'regional_brackets', 'scoring_rubric', 'blank_ranking', 'receipt_footer'],
      scoring: {
        exclusivity: { weight: 0.35 },
        crunch: { weight: 0.25 },
        regional_pride: { weight: 0.25 },
        hot_take: { weight: 0.15 },
      },
      regions: ['Northeast', 'South', 'Midwest', 'West', 'Road Trip Wildcard'],
    },
    vaultFolder: 'vault/sprint-2-gas-station',
    sprintNumber: 2,
  },
  {
    id: 'sprint-3-too-late',
    slug: 'sprint-3-too-late',
    name: 'Is It Too Late to Reply? Flowchart',
    price: 5,
    status: 'queued',
    buildWindow: '2026-08-23/24',
    launchDate: '2026-08-26',
    receiptDate: '2026-08-28',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes:
      'Single-page decision tree by time-since-text, escalating self-deprecation, receipt footer',
    schema: {
      format: 'flowchart_pdf',
      pages: ['single_page_decision_tree', 'receipt_footer'],
      timeBands: [
        { maxHours: 2, verdict: 'Totally fine. Send it.' },
        { maxHours: 24, verdict: 'Casual opener + acknowledge delay' },
        { maxHours: 72, verdict: 'Self-deprecate lightly, then value' },
        { maxHours: 168, verdict: 'Honest restart or let it go' },
        { maxHours: null, verdict: 'New thread or voice note only' },
      ],
    },
    vaultFolder: 'vault/sprint-3-too-late',
    sprintNumber: 3,
  },
  {
    id: 'sprint-4-memory-jogger',
    slug: 'sprint-4-memory-jogger',
    name: 'Memory Jogger PDF',
    price: 7,
    status: 'queued',
    buildWindow: '2026-08-30/31',
    launchDate: '2026-09-02',
    receiptDate: '2026-09-04',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes: 'Five daily recall prompts, weekly compound review, sovereign attention footer, receipt block',
    schema: {
      format: 'prompt_pdf',
      pages: ['cover', 'five_daily_prompts', 'weekly_compound', 'blank_journal', 'receipt_footer'],
      prompts: ['What mattered yesterday?', 'What did you defer?', 'Who needs a reply?', 'What would ship today?', 'What receipt will you post?'],
    },
    vaultFolder: 'vault/sprint-4-memory-jogger',
    sprintNumber: 4,
  },
  {
    id: 'sprint-5-receipt-reel',
    slug: 'sprint-5-receipt-reel',
    name: 'Receipt Reel Template Pack',
    price: 12,
    status: 'queued',
    buildWindow: '2026-09-06/07',
    launchDate: '2026-09-09',
    receiptDate: '2026-09-11',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes: 'Canva-ready receipt templates, Chaos Ledger copy blocks, vertical split visuals, proof-first captions',
    schema: {
      format: 'template_pack',
      pages: ['template_index', 'receipt_reel_script_blocks', 'ledger_copy_snippets', 'vertical_split_layouts'],
      verticals: ['food', 'water', 'energy', 'ops'],
    },
    vaultFolder: 'vault/sprint-5-receipt-reel',
    sprintNumber: 5,
  },
  {
    id: 'sprint-6-margin-map',
    slug: 'sprint-6-margin-map',
    name: 'Margin Map Workbook',
    price: 15,
    status: 'queued',
    buildWindow: '2026-09-13/14',
    launchDate: '2026-09-16',
    receiptDate: '2026-09-18',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes: 'Margin leak map, COGS vs delivery vs ops lanes, 20-min audit worksheet, receipt footer',
    schema: {
      format: 'workbook_pdf',
      pages: ['cover', 'margin_map_canvas', 'leak_checklist', '20_min_audit', 'receipt_footer'],
      lanes: ['COGS', 'delivery', 'ops', 'hidden_time'],
    },
    vaultFolder: 'vault/sprint-6-margin-map',
    sprintNumber: 6,
  },
  {
    id: 'sprint-7-trust-vault',
    slug: 'sprint-7-trust-vault',
    name: 'Trust Vault Checklist',
    price: 8,
    status: 'queued',
    buildWindow: '2026-09-20/21',
    launchDate: '2026-09-23',
    receiptDate: '2026-09-25',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes: 'Governance artifacts buyers verify, AURELIUS-grade policy snippets, audit-ready checklist, receipt footer',
    schema: {
      format: 'checklist_pdf',
      pages: ['cover', 'trust_artifacts', 'policy_snippets', 'audit_checklist', 'receipt_footer'],
      tags: ['AURELIUS-P0', 'SPECTRA-REVIEW'],
    },
    vaultFolder: 'vault/sprint-7-trust-vault',
    sprintNumber: 7,
  },
  {
    id: 'sprint-8-ops-pulse',
    slug: 'sprint-8-ops-pulse',
    name: 'Ops Pulse Dashboard',
    price: 10,
    status: 'queued',
    buildWindow: '2026-09-27/28',
    launchDate: '2026-09-30',
    receiptDate: '2026-10-02',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    schemaNotes: 'Single-screen ops heartbeat, no SaaS lock-in, printable + Notion duplicate schema, receipt footer',
    schema: {
      format: 'dashboard_pdf',
      pages: ['cover', 'ops_pulse_screen', 'notion_schema', 'weekly_ritual', 'receipt_footer'],
      metrics: ['inbox_zero', 'ship_log', 'ledger_pulse', 'blockers'],
    },
    vaultFolder: 'vault/sprint-8-ops-pulse',
    sprintNumber: 8,
  },
];

const SPRINT_PDF_IDS = [
  'sprint-2-gas-station', 'sprint-3-too-late', 'sprint-4-memory-jogger',
  'sprint-5-receipt-reel', 'sprint-6-margin-map', 'sprint-7-trust-vault', 'sprint-8-ops-pulse',
];

export const BUNDLE_REGISTRY_ENTRY: ProductRegistryEntry = {
  id: 'bundle-growth-compass',
  slug: 'bundle-growth-compass',
  name: 'Growth Compass Bundle',
  price: 29,
  status: 'queued',
  buildWindow: '2026-10-03/04',
  launchDate: '2026-10-04',
  receiptDate: '2026-10-04',
  reelTimesEt: ['10:00', '12:00', '14:00'],
  schemaNotes: 'All 8 PDFs capstone bundle, master receipt, portfolio proof post, vertical impact summary',
  schema: {
    format: 'bundle',
    includes: SPRINT_PDF_IDS,
    pages: ['bundle_index', 'master_receipt', 'portfolio_proof_post'],
  },
  vaultFolder: 'vault/bundle-growth-compass',
  sprintNumber: 9,
};

export const ALL_PRODUCTS: ProductRegistryEntry[] = [...PRODUCT_REGISTRY, BUNDLE_REGISTRY_ENTRY];

export function getRegistryProduct(idOrSlug: string): ProductRegistryEntry | undefined {
  return ALL_PRODUCTS.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getRegistryJson(): { products: Array<Record<string, unknown>>; bundle: typeof BUNDLE_DAY; schedule: typeof SPRINT_SCHEDULE } {
  return {
    products: ALL_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      status: p.status,
      build_window: p.buildWindow,
      launch_date: p.launchDate,
      receipt_date: p.receiptDate,
      reel_times_et: p.reelTimesEt,
      schema_notes: p.schemaNotes,
      schema: p.schema,
      vault_folder: p.vaultFolder,
      sprint_number: p.sprintNumber,
    })),
    bundle: BUNDLE_DAY,
    schedule: SPRINT_SCHEDULE,
  };
}

export function seedAllRegistryFromSchedule(): void {
  for (const sprint of SPRINT_SCHEDULE) {
    const product = getRegistryProduct(sprint.productId);
    if (!product) continue;
    const endDay = sprint.buildEnd.split('-')[2];
    product.buildWindow = `${sprint.buildStart}/${endDay}`;
    product.launchDate = sprint.launchDate;
    product.receiptDate = sprint.receiptDate;
    product.reelTimesEt = sprint.reelTimesEt;
  }
}

seedAllRegistryFromSchedule();
