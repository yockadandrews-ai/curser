import { BRAND_PRODUCTS, type BrandProduct } from './brands.js';

/** Env var name per product id for Stripe Payment Link URL */
const STRIPE_LINK_ENV: Record<string, string> = {
  'vv-beat-pack': 'STRIPE_LINK_VV_BEAT_PACK',
  'vv-templates': 'STRIPE_LINK_VV_TEMPLATES',
  'vv-course': 'STRIPE_LINK_VV_COURSE',
  'as-daily': 'STRIPE_LINK_AS_DAILY',
  'as-guidebook': 'STRIPE_LINK_AS_GUIDEBOOK',
  'as-birth-chart': 'STRIPE_LINK_AS_BIRTH_CHART',
  'mm-journal': 'STRIPE_LINK_MM_JOURNAL',
  'mm-challenge': 'STRIPE_LINK_MM_CHALLENGE',
  'mm-app': 'STRIPE_LINK_MM_APP',
  'rs-scan': 'STRIPE_LINK_RS_SCAN',
  'rs-unlimited': 'STRIPE_LINK_RS_UNLIMITED',
  'rs-agency': 'STRIPE_LINK_RS_AGENCY',
  '33-practice': 'STRIPE_LINK_33_PRACTICE',
  '33-forge': 'STRIPE_LINK_33_FORGE',
  '33-crown': 'STRIPE_LINK_33_CROWN',
};

export interface StoreProduct extends BrandProduct {
  stripeUrl: string | null;
  priceLabel: string;
  configured: boolean;
}

function formatPrice(cents: number, type: 'one_time' | 'subscription'): string {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return type === 'subscription' ? `$${dollars}/mo` : `$${dollars}`;
}

export function getStripePaymentLink(productId: string): string | null {
  const envKey = STRIPE_LINK_ENV[productId];
  if (!envKey) return null;
  const url = process.env[envKey]?.trim();
  return url || null;
}

export function getStoreProducts(): StoreProduct[] {
  return BRAND_PRODUCTS.map(p => {
    const stripeUrl = getStripePaymentLink(p.id);
    return {
      ...p,
      stripeUrl,
      priceLabel: formatPrice(p.priceCents, p.type),
      configured: Boolean(stripeUrl),
    };
  });
}

export function getStoreByBrand(): Record<string, StoreProduct[]> {
  const grouped: Record<string, StoreProduct[]> = {};
  for (const p of getStoreProducts()) {
    if (!grouped[p.brand]) grouped[p.brand] = [];
    grouped[p.brand].push(p);
  }
  return grouped;
}

export function getFeaturedCheckoutLinks(): Array<{ productId: string; name: string; stripeUrl: string; priceLabel: string }> {
  const featured = ['vv-beat-pack', 'as-guidebook', 'mm-challenge', 'rs-scan', '33-practice'];
  return featured
    .map(id => getStoreProducts().find(p => p.id === id))
    .filter((p): p is StoreProduct => Boolean(p?.stripeUrl))
    .map(p => ({
      productId: p.id,
      name: p.name,
      stripeUrl: p.stripeUrl!,
      priceLabel: p.priceLabel,
    }));
}

export function countConfiguredStripeLinks(): number {
  return getStoreProducts().filter(p => p.configured).length;
}
