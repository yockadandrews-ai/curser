import { v4 as uuidv4 } from 'uuid';
import type { Product } from '../db.js';
import { addProduct, getProducts, logActivity } from '../db.js';

interface DiscoveredProduct {
  name: string;
  cost: number;
  sellPrice: number;
  category: string;
  viralScore: number;
  affiliateLink?: string;
}

const TRENDING_NICHES: Record<string, DiscoveredProduct[]> = {
  'side hustle': [
    { name: 'Portable Phone Stand Ring Light', cost: 8.50, sellPrice: 34.99, category: 'tech accessories', viralScore: 92 },
    { name: 'Digital Planner Template Bundle', cost: 0, sellPrice: 27.00, category: 'digital products', viralScore: 88 },
    { name: 'Resin Jewelry Making Kit', cost: 12.00, sellPrice: 49.99, category: 'crafts', viralScore: 85 },
    { name: 'Mini Bluetooth Label Printer', cost: 15.00, sellPrice: 59.99, category: 'office', viralScore: 90 },
    { name: 'LED Strip Lights RGB 32ft', cost: 6.00, sellPrice: 29.99, category: 'home decor', viralScore: 87 },
  ],
  fitness: [
    { name: 'Resistance Bands Set Pro', cost: 9.00, sellPrice: 39.99, category: 'fitness', viralScore: 91 },
    { name: 'Smart Water Bottle Tracker', cost: 11.00, sellPrice: 44.99, category: 'fitness', viralScore: 86 },
    { name: 'Yoga Mat Non-Slip Extra Thick', cost: 14.00, sellPrice: 54.99, category: 'fitness', viralScore: 84 },
    { name: 'Posture Corrector Back Brace', cost: 7.50, sellPrice: 32.99, category: 'health', viralScore: 89 },
    { name: 'Protein Shaker Bottle 24oz', cost: 4.00, sellPrice: 19.99, category: 'fitness', viralScore: 82 },
  ],
  beauty: [
    { name: 'Ice Roller Face Massager', cost: 5.00, sellPrice: 24.99, category: 'skincare', viralScore: 93 },
    { name: 'Lash Cluster Kit DIY', cost: 8.00, sellPrice: 36.99, category: 'beauty', viralScore: 95 },
    { name: 'Gua Sha Stone Set', cost: 3.50, sellPrice: 22.99, category: 'skincare', viralScore: 88 },
    { name: 'Hair Growth Serum Roller', cost: 6.00, sellPrice: 29.99, category: 'hair care', viralScore: 90 },
    { name: 'LED Face Mask Light Therapy', cost: 25.00, sellPrice: 89.99, category: 'skincare', viralScore: 87 },
  ],
  default: [
    { name: 'Wireless Earbuds Pro Clone', cost: 12.00, sellPrice: 49.99, category: 'electronics', viralScore: 91 },
    { name: 'Car Phone Mount Magnetic', cost: 4.50, sellPrice: 19.99, category: 'automotive', viralScore: 85 },
    { name: 'Cloud Slides Ultra Soft', cost: 8.00, sellPrice: 34.99, category: 'fashion', viralScore: 94 },
    { name: 'Mini Projector 1080P', cost: 35.00, sellPrice: 129.99, category: 'electronics', viralScore: 89 },
    { name: 'Portable Blender USB', cost: 10.00, sellPrice: 39.99, category: 'kitchen', viralScore: 86 },
  ],
};

async function fetchRedditTrends(niche: string): Promise<string[]> {
  try {
    const subreddits = niche.includes('fitness') ? 'fitness+BuyItForLife' :
      niche.includes('beauty') ? 'SkincareAddiction+MakeupAddiction' :
      'Entrepreneur+sidehustle+Flipping';
    const res = await fetch(`https://www.reddit.com/r/${subreddits}/hot.json?limit=10`, {
      headers: { 'User-Agent': 'MoneyAutopilot/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { children?: Array<{ data?: { title?: string } }> } };
    return (data.data?.children || [])
      .map(c => c.data?.title || '')
      .filter(t => t.length > 10)
      .slice(0, 3);
  } catch {
    return [];
  }
}

function calculateViralScore(product: DiscoveredProduct): number {
  const margin = product.sellPrice - product.cost;
  const marginPct = product.cost > 0 ? (margin / product.cost) * 100 : 100;
  const baseScore = product.viralScore;
  const marginBonus = Math.min(marginPct / 5, 15);
  return Math.min(99, Math.round(baseScore + marginBonus));
}

export async function discoverTopProducts(niche: string, limit = 5): Promise<Product[]> {
  const existing = getProducts();
  const existingNames = new Set(existing.map(p => p.name.toLowerCase()));

  const nicheKey = Object.keys(TRENDING_NICHES).find(k => niche.toLowerCase().includes(k)) || 'default';
  let candidates = [...TRENDING_NICHES[nicheKey]];

  const redditTrends = await fetchRedditTrends(niche);
  if (redditTrends.length > 0) {
    logActivity('discover', `Scanned Reddit trends: ${redditTrends.slice(0, 2).join(', ')}`);
  }

  candidates = candidates
    .filter(c => !existingNames.has(c.name.toLowerCase()))
    .map(c => ({ ...c, viralScore: calculateViralScore(c) }))
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, limit);

  const discovered: Product[] = [];
  for (const candidate of candidates) {
    const product = addProduct({
      id: uuidv4(),
      name: candidate.name,
      cost: candidate.cost,
      sellPrice: candidate.sellPrice,
      category: candidate.category,
      productType: 'product',
      brand: 'other',
      source: 'discovered',
      viralScore: candidate.viralScore,
      affiliateLink: candidate.affiliateLink,
    });
    discovered.push(product);
    logActivity('discover', `🔍 Discovered winner: ${product.name} (viral score: ${product.viralScore})`);
  }

  return discovered;
}

export function getTopProducts(limit = 5): Product[] {
  const sgosTools = getProducts().filter(p => p.brand === 'sgos' && p.productType === 'tool');
  const others = getProducts().filter(p => !(p.brand === 'sgos' && p.productType === 'tool'));

  const sortedTools = sgosTools.sort((a: Product, b: Product) => {
    const scoreA = a.viralScore + (a.unitsSold ?? 0) * 2;
    const scoreB = b.viralScore + (b.unitsSold ?? 0) * 2;
    return scoreB - scoreA;
  });

  const sortedOthers = others.sort((a: Product, b: Product) => {
    const marginA = a.sellPrice - a.cost;
    const marginB = b.sellPrice - b.cost;
    return (b.viralScore + marginB) - (a.viralScore + marginA);
  });

  return [...sortedTools, ...sortedOthers].slice(0, limit);
}
