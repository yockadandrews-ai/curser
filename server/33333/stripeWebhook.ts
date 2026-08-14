import crypto from 'crypto';
import { logActivity } from '../db.js';
import { convertBrandLead, recordRevenueEvent, addEngagement } from './db.js';
import { isBrand33333 } from './brands.js';
import type { Brand33333 } from './types.js';

function resolveBrand(metadata: Record<string, string | undefined>): Brand33333 {
  const brand = metadata.brand ?? metadata.Brand ?? '33333';
  return isBrand33333(brand) ? brand : '33333';
}

export function verifyStripeSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  const payload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function handleStripeEvent(event: {
  type: string;
  data: { object: Record<string, unknown> };
}): { handled: boolean; message: string } {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = (session.metadata ?? {}) as Record<string, string | undefined>;
      const brand = resolveBrand(metadata);
      const product = metadata.product ?? 'unknown';
      const amount = (session.amount_total as number | undefined) ?? 0;
      const txnId = session.id as string;
      const email = ((session.customer_details as Record<string, unknown> | undefined)?.email as string | undefined)
        ?? (session.customer_email as string | undefined);

      recordRevenueEvent({
        transactionId: txnId,
        grossCents: amount,
        brand,
        product,
        utmCampaign: metadata.utm_campaign,
      });

      if (email) convertBrandLead(email, brand, amount);
      logActivity('33333_sale', `Stripe checkout ${txnId} · ${brand} · $${(amount / 100).toFixed(2)}`);
      return { handled: true, message: `Recorded sale ${txnId}` };
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const metadata = (session.metadata ?? {}) as Record<string, string | undefined>;
      const brand = resolveBrand(metadata);
      const email = session.customer_email as string | undefined;
      const sessionId = session.id as string;

      addEngagement({
        brand,
        platform: 'stripe',
        message: `Abandoned cart: ${metadata.product ?? 'product'} — ${email ?? 'unknown email'}`,
        sessionId,
        status: 'pending',
      });

      logActivity('33333_abandoned_cart', `Cart expired ${sessionId}`);
      return { handled: true, message: `Abandoned cart logged ${sessionId}` };
    }

    default:
      return { handled: false, message: `Ignored event type ${event.type}` };
  }
}
