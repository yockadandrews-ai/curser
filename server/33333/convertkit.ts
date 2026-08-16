import { logActivity } from '../db.js';
import type { Brand33333 } from './types.js';

/** ConvertKit form ID per brand — triggers welcome sequence automations */
const CONVERTKIT_FORM_ENV: Record<Brand33333, string> = {
  vaultverse: 'CONVERTKIT_FORM_VAULTVERSE',
  aurascript: 'CONVERTKIT_FORM_AURASCRIPT',
  mirrorme: 'CONVERTKIT_FORM_MIRRORME',
  resume: 'CONVERTKIT_FORM_RESUME',
  '33333': 'CONVERTKIT_FORM_33333',
};

/** Optional tag IDs applied on subscribe (comma-separated in env) */
const CONVERTKIT_TAG_ENV: Record<Brand33333, string> = {
  vaultverse: 'CONVERTKIT_TAG_VAULTVERSE',
  aurascript: 'CONVERTKIT_TAG_AURASCRIPT',
  mirrorme: 'CONVERTKIT_TAG_MIRRORME',
  resume: 'CONVERTKIT_TAG_RESUME',
  '33333': 'CONVERTKIT_TAG_33333',
};

/** Abandoned cart tag — n8n Water phase can apply via API */
const ABANDONED_CART_TAG_ENV = 'CONVERTKIT_TAG_ABANDONED_CART';

export interface ConvertKitConfig {
  configured: boolean;
  forms: Record<Brand33333, string | null>;
  tags: Record<Brand33333, string | null>;
  abandonedCartTag: string | null;
  apiBase: string;
}

export function getConvertKitConfig(): ConvertKitConfig {
  const forms = {} as Record<Brand33333, string | null>;
  const tags = {} as Record<Brand33333, string | null>;

  for (const brand of Object.keys(CONVERTKIT_FORM_ENV) as Brand33333[]) {
    forms[brand] = process.env[CONVERTKIT_FORM_ENV[brand]]?.trim() || null;
    tags[brand] = process.env[CONVERTKIT_TAG_ENV[brand]]?.trim() || null;
  }

  return {
    configured: Boolean(process.env.CONVERTKIT_API_KEY?.trim()),
    forms,
    tags,
    abandonedCartTag: process.env[ABANDONED_CART_TAG_ENV]?.trim() || null,
    apiBase: 'https://api.convertkit.com/v3',
  };
}

function getApiKey(): string | null {
  return process.env.CONVERTKIT_API_KEY?.trim() || null;
}

function parseTagIds(envValue: string | null | undefined): number[] {
  if (!envValue) return [];
  return envValue.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
}

async function convertKitPost(path: string, body: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'CONVERTKIT_API_KEY not set' };

  try {
    const res = await fetch(`https://api.convertkit.com/v3${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, ...body }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: JSON.stringify(data) };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function subscribeToWelcomeSequence(data: {
  email: string;
  firstName?: string;
  brand: Brand33333;
  leadMagnet: string;
  utmSource?: string;
}): Promise<{ ok: boolean; formId?: string; error?: string; simulated?: boolean }> {
  const config = getConvertKitConfig();
  const formId = config.forms[data.brand];

  if (!config.configured || !formId) {
    logActivity('33333_email_sim', `ConvertKit sim: ${data.email} → ${data.brand}/${data.leadMagnet}`);
    return { ok: true, simulated: true, error: 'ConvertKit not configured — lead saved locally only' };
  }

  const tagIds = parseTagIds(config.tags[data.brand]);
  const fields: Record<string, string> = {
    lead_magnet: data.leadMagnet,
  };
  if (data.utmSource) fields.utm_source = data.utmSource;

  const result = await convertKitPost(`/forms/${formId}/subscribe`, {
    email: data.email.toLowerCase().trim(),
    first_name: data.firstName?.trim() || '',
    tags: tagIds,
    fields,
  });

  if (result.ok) {
    logActivity('33333_email', `ConvertKit subscribed ${data.email} → form ${formId} (${data.brand})`);
    return { ok: true, formId };
  }

  logActivity('33333_email_error', `ConvertKit failed ${data.email}: ${result.error}`);
  return { ok: false, error: result.error, formId };
}

export async function tagAbandonedCart(email: string, productName?: string): Promise<{ ok: boolean; simulated?: boolean; error?: string }> {
  const config = getConvertKitConfig();
  const tagId = config.abandonedCartTag;

  if (!config.configured || !tagId) {
    return { ok: true, simulated: true, error: 'Abandoned cart tag not configured' };
  }

  const result = await convertKitPost(`/tags/${tagId}/subscribe`, {
    email: email.toLowerCase().trim(),
    fields: productName ? { abandoned_product: productName } : {},
  });

  if (result.ok) {
    logActivity('33333_abandoned_cart_email', `ConvertKit abandoned cart tag → ${email}`);
    return { ok: true };
  }
  return { ok: false, error: result.error };
}

export async function subscribeToMembership(email: string, tier: 'practice' | 'forge' | 'crown', firstName?: string): Promise<{ ok: boolean; error?: string }> {
  return subscribeToWelcomeSequence({
    email,
    firstName,
    brand: '33333',
    leadMagnet: `membership-${tier}`,
    utmSource: 'stripe-checkout',
  });
}
