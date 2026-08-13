/**
 * SGOS Content Factory — 8 PDF product schemas (Goldie Content Factory mapped)
 */

export interface ContentProductSchema {
  slug: string;
  name: string;
  tagline: string;
  gumroadCategory: string;
  platforms: ('x' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok')[];
  reelHooks: string[];
  captionTone: string;
  vaultFolder: string;
  notionTemplateId: string;
  buildOutputs: string[];
  launchOutputs: string[];
  receiptMetric: string;
}

export const CONTENT_PRODUCTS: ContentProductSchema[] = [
  {
    slug: 'memory-jogger',
    name: 'Memory Jogger PDF',
    tagline: 'Daily recall prompts that compound sovereign attention.',
    gumroadCategory: 'Productivity',
    platforms: ['instagram', 'x', 'linkedin'],
    reelHooks: ['Stop forgetting what mattered yesterday', 'One page. Five prompts. Zero fluff.'],
    captionTone: 'Calm, precise, founder-grade',
    vaultFolder: 'vault/memory-jogger',
    notionTemplateId: 'brief-memory-jogger',
    buildOutputs: ['PDF draft', 'Gumroad listing copy', 'Receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'downloads',
  },
  {
    slug: 'gas-station',
    name: 'Gas Station Lead Kit',
    tagline: 'Fill-up moments → qualified leads without ad spend.',
    gumroadCategory: 'Marketing',
    platforms: ['instagram', 'facebook', 'x'],
    reelHooks: ['Your best leads are already stopping for gas', 'Turn idle traffic into inbox gold'],
    captionTone: 'Direct response, local-trust',
    vaultFolder: 'vault/gas-station',
    notionTemplateId: 'brief-gas-station',
    buildOutputs: ['Lead magnet PDF', 'Landing copy', 'Receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'leads_captured',
  },
  {
    slug: 'receipt-reel-pack',
    name: 'Receipt Reel Template Pack',
    tagline: 'Public proof posts from real Ledger numbers.',
    gumroadCategory: 'Creator Tools',
    platforms: ['instagram', 'tiktok', 'x'],
    reelHooks: ['Show the receipt, not the flex', 'Impact posts that survive scrutiny'],
    captionTone: 'Transparent, receipt-first',
    vaultFolder: 'vault/receipt-reel-pack',
    notionTemplateId: 'brief-receipt-reel',
    buildOutputs: ['Template PDF', 'Canva JSON schema', 'Receipt copy blocks'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'receipt_posts',
  },
  {
    slug: 'margin-map',
    name: 'Margin Map Workbook',
    tagline: 'See where margin leaks before they become fires.',
    gumroadCategory: 'Operations',
    platforms: ['linkedin', 'x'],
    reelHooks: ['Margin is a map, not a mood', 'Find the leak in 20 minutes'],
    captionTone: 'Operator-sharp',
    vaultFolder: 'vault/margin-map',
    notionTemplateId: 'brief-margin-map',
    buildOutputs: ['Workbook PDF', 'Gumroad copy', 'Ops receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'worksheets_completed',
  },
  {
    slug: 'trust-vault',
    name: 'Trust Vault Checklist',
    tagline: 'Governance artifacts buyers can verify.',
    gumroadCategory: 'Governance',
    platforms: ['linkedin', 'x'],
    reelHooks: ['Trust is a vault, not a vibe', 'Checklists that survive audit'],
    captionTone: 'AURELIUS-grade sober',
    vaultFolder: 'vault/trust-vault',
    notionTemplateId: 'brief-trust-vault',
    buildOutputs: ['Checklist PDF', 'Policy snippets', 'Receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'checklists_shipped',
  },
  {
    slug: 'lead-magnet-sprint',
    name: 'Lead Magnet Sprint Kit',
    tagline: 'Ship a magnet in one weekend — gated end-to-end.',
    gumroadCategory: 'Marketing',
    platforms: ['instagram', 'facebook', 'linkedin'],
    reelHooks: ['Weekend sprint. Monday leads.', 'Magnet first, ads never.'],
    captionTone: 'Sprint energy, sovereign constraints',
    vaultFolder: 'vault/lead-magnet-sprint',
    notionTemplateId: 'brief-lead-magnet',
    buildOutputs: ['Magnet PDF', 'Email capture copy', 'Receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'opt_ins',
  },
  {
    slug: 'ops-pulse',
    name: 'Ops Pulse Dashboard',
    tagline: 'Daily ops heartbeat without SaaS lock-in.',
    gumroadCategory: 'Operations',
    platforms: ['linkedin', 'x'],
    reelHooks: ['Ops pulse in one screen', 'No dashboard subscription required'],
    captionTone: 'Systems-first',
    vaultFolder: 'vault/ops-pulse',
    notionTemplateId: 'brief-ops-pulse',
    buildOutputs: ['Dashboard PDF', 'Notion duplicate schema', 'Receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Day review checklist'],
    receiptMetric: 'dashboards_adopted',
  },
  {
    slug: 'growth-compass',
    name: 'Growth Compass Bundle',
    tagline: 'Bundle day capstone — all verticals, one receipt.',
    gumroadCategory: 'Bundle',
    platforms: ['instagram', 'x', 'linkedin', 'facebook'],
    reelHooks: ['The bundle that closes the loop', 'Eight tools. One compass.'],
    captionTone: 'Capstone, portfolio-wide',
    vaultFolder: 'vault/growth-compass',
    notionTemplateId: 'brief-growth-compass',
    buildOutputs: ['Bundle PDF index', 'Bundle Gumroad copy', 'Master receipt template'],
    launchOutputs: ['3 Reel scripts', '3 captions', 'Bundle day review'],
    receiptMetric: 'bundle_sales',
  },
];

export function getContentProduct(slug: string): ContentProductSchema | undefined {
  return CONTENT_PRODUCTS.find(p => p.slug === slug);
}

export function getProductsFrom(slug: string): ContentProductSchema[] {
  const idx = CONTENT_PRODUCTS.findIndex(p => p.slug === slug);
  if (idx < 0) return CONTENT_PRODUCTS;
  return CONTENT_PRODUCTS.slice(idx);
}
