import type { Brand33333 } from './types.js';

export interface BrandProduct {
  id: string;
  brand: Brand33333;
  name: string;
  priceCents: number;
  type: 'one_time' | 'subscription';
  leadMagnet?: string;
}

export const BRAND_META: Record<Brand33333, { label: string; tagline: string; accent: string }> = {
  vaultverse: { label: 'VaultVerse', tagline: 'Loops that breathe. Templates that ship.', accent: '#e85d4c' },
  aurascript: { label: 'AuraScript', tagline: 'Your day, decoded. Your balance, restored.', accent: '#7eb8da' },
  mirrorme: { label: 'MirrorMe', tagline: 'See yourself clearly. Move with intention.', accent: '#4caf8a' },
  resume: { label: 'Resume SaaS', tagline: 'ATS-proof resumes in 60 seconds.', accent: '#c4a35a' },
  '33333': { label: '33333', tagline: 'Lead. Flow. Rise.', accent: '#9b7ddb' },
};

export const BRAND_PRODUCTS: BrandProduct[] = [
  { id: 'vv-beat-pack', brand: 'vaultverse', name: '7-Loop Beat Pack', priceCents: 2700, type: 'one_time', leadMagnet: '3-loop-pack' },
  { id: 'vv-templates', brand: 'vaultverse', name: 'Mixing Template Bundle', priceCents: 6700, type: 'one_time' },
  { id: 'vv-course', brand: 'vaultverse', name: "Producer's Vault Course", priceCents: 19700, type: 'one_time' },
  { id: 'as-daily', brand: 'aurascript', name: 'Daily Readings', priceCents: 900, type: 'subscription', leadMagnet: 'moon-calendar' },
  { id: 'as-guidebook', brand: 'aurascript', name: 'Elemental Guidebook', priceCents: 3700, type: 'one_time' },
  { id: 'as-birth-chart', brand: 'aurascript', name: 'Birth Chart Deep Dive', priceCents: 4700, type: 'one_time' },
  { id: 'mm-journal', brand: 'mirrorme', name: 'Reflection Journal Template', priceCents: 1900, type: 'one_time', leadMagnet: '7-day-prompts' },
  { id: 'mm-challenge', brand: 'mirrorme', name: '30-Day Mirror Challenge', priceCents: 4900, type: 'one_time' },
  { id: 'mm-app', brand: 'mirrorme', name: 'MirrorMe App', priceCents: 499, type: 'subscription' },
  { id: 'rs-scan', brand: 'resume', name: 'Resume Scan', priceCents: 900, type: 'one_time', leadMagnet: 'free-score' },
  { id: 'rs-unlimited', brand: 'resume', name: 'Unlimited Pro', priceCents: 2900, type: 'subscription' },
  { id: 'rs-agency', brand: 'resume', name: 'Agency', priceCents: 19900, type: 'subscription' },
  { id: '33-practice', brand: '33333', name: 'The Practice', priceCents: 2900, type: 'subscription', leadMagnet: 'foundations' },
  { id: '33-forge', brand: '33333', name: 'The Forge', priceCents: 9900, type: 'subscription' },
  { id: '33-crown', brand: '33333', name: 'The Crown', priceCents: 49700, type: 'subscription' },
];

const BRAND_SET = new Set<string>(Object.keys(BRAND_META));

export function isBrand33333(value: string): value is Brand33333 {
  return BRAND_SET.has(value);
}

export function getDefaultLeadMagnetUrl(brand: Brand33333): string {
  const base = (process.env.LEAD_MAGNET_BASE_URL || process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/33333/#free-${brand}`;
}
