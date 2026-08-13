/**
 * Live product registry — synced with primary Google Calendar (America/New_York)
 * Source of truth for Hermes Content Factory + n8n calendar triggers.
 */

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
        exclusivity: { weight: 0.35, label: 'Can you only get this here?' },
        crunch: { weight: 0.25, label: 'Texture payoff' },
        regional_pride: { weight: 0.25, label: 'Locals would fight for it' },
        hot_take: { weight: 0.15, label: 'Spicy opinion slot' },
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
];

export function getRegistryProduct(idOrSlug: string): ProductRegistryEntry | undefined {
  return PRODUCT_REGISTRY.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getRegistryJson(): { products: Array<Record<string, unknown>> } {
  return {
    products: PRODUCT_REGISTRY.map(p => ({
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
  };
}
