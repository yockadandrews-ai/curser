import { getAllAppsForCatalog } from '../factory/longFormProposals.js';

function parseMidPrice(pricing: string): number | null {
  const nums = pricing.match(/\$(\d+)/g);
  if (!nums) return null;
  const values = nums.map(n => parseInt(n.replace('$', ''), 10));
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function resolveCatalogPrice(appName: string, suggestedPricing: string): number | null {
  if (appName === 'Bridge-Builder AI') return 149;
  return parseMidPrice(suggestedPricing);
}

export const KIMI3_COMPANION_TOOLS = [
  { name: 'Money Autopilot Engine', description: 'Background automation — discover, generate, post on schedule', category: 'automation', sellPrice: 197, stock: 999 },
  { name: 'Daily Factory Generator', description: '5 apps + 5 proposals per day — themed clusters for Cursor', category: 'automation', sellPrice: 47, stock: 999 },
  { name: 'Viral Cash Generator', description: 'Platform-specific viral content for your products and tools', category: 'content', sellPrice: 47, stock: 999 },
  { name: 'Proposal Writer AI', description: 'Long-form sales proposals from app definitions — email & LinkedIn ready', category: 'sales', sellPrice: 37, stock: 999 },
  { name: 'Notion Tool Tracker', description: 'Inventory, pricing, and per-tool sales for your Notion catalog', category: 'inventory', sellPrice: 29, stock: 999 },
  { name: 'Liquid Glass UI Kit', description: 'Shared design system — Glass Slider, Shredder, gift-box components', category: 'design', sellPrice: 97, stock: 500 },
  { name: 'Cursor Handoff Packager', description: 'Dated folders with Apps, Proposals, and Master Notes for engineering', category: 'devops', sellPrice: 19, stock: 999 },
  { name: 'Sovereign Growth OS Dashboard', description: 'Master command center connecting all portals and suites', category: 'dashboard', sellPrice: 147, stock: 200 },
];

export interface CatalogToolSeed {
  name: string;
  description: string;
  category: string;
  sellPrice: number | null;
  stock: number;
  source: 'factory' | 'kimi3';
  theme?: string;
}

export function buildNotionCatalog(): CatalogToolSeed[] {
  const factoryTools: CatalogToolSeed[] = getAllAppsForCatalog().map(app => ({
    name: app.appName,
    description: app.oneLinePromise,
    category: app.theme.split(' & ')[0].toLowerCase(),
    sellPrice: resolveCatalogPrice(app.appName, app.suggestedPricing),
    stock: 500,
    source: 'factory' as const,
    theme: app.theme,
  }));

  const companions: CatalogToolSeed[] = KIMI3_COMPANION_TOOLS.map(t => ({
    ...t,
    source: 'kimi3' as const,
  }));

  return [...factoryTools, ...companions];
}

export const NOTION_CATALOG_STATS = {
  factoryApps: 25,
  kimi3Companions: 8,
  totalTools: 33,
};
