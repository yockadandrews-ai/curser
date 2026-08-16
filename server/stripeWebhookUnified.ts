import express, { type Express } from 'express';
import Stripe from 'stripe';
import { handleEngineCheckoutCompleted, ENGINE_PRODUCT, isStripeConfigured } from './checkout.js';
import { handleStripeEvent, verifyStripeSignature } from './33333/stripeWebhook.js';

function getStripeForWebhook(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

async function parseStripeEvent(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ event: Stripe.Event } | { error: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return { error: 'STRIPE_WEBHOOK_SECRET not configured' };
  if (!signature) return { error: 'Missing stripe-signature header' };

  const stripe = getStripeForWebhook();
  if (stripe) {
    try {
      return { event: stripe.webhooks.constructEvent(rawBody, signature, webhookSecret) };
    } catch (e) {
      return { error: `Webhook signature verification failed: ${String(e)}` };
    }
  }

  if (!verifyStripeSignature(rawBody, signature)) {
    return { error: 'Invalid Stripe signature' };
  }
  try {
    return { event: JSON.parse(rawBody.toString('utf8')) as Stripe.Event };
  } catch {
    return { error: 'Invalid JSON body' };
  }
}

async function dispatchEvent(event: Stripe.Event): Promise<{ handled: boolean; message: string; lane?: string }> {
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.expired') {
    return { handled: false, message: `Unhandled event type: ${event.type}` };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const productId = session.metadata?.productId;
  const brand = session.metadata?.brand;

  // Outreach — $197 Engine (Checkout Session API)
  if (productId === ENGINE_PRODUCT.id) {
    if (event.type === 'checkout.session.completed') {
      const result = await handleEngineCheckoutCompleted(session);
      return { ...result, lane: 'outreach' };
    }
    return { handled: true, message: 'Engine checkout expired — no action', lane: 'outreach' };
  }

  // Sovereign — Solar B2B ($15K deposit via Payment Link metadata)
  if (productId?.startsWith('sovereign-')) {
    if (event.type === 'checkout.session.completed') {
      const { ingestInbound, recordSignature } = await import('./sovereign/loop.js');
      const email = session.customer_details?.email || session.customer_email;
      const company = session.metadata?.company || email || 'Solar client';
      const inbound = ingestInbound({
        channel: 'application',
        name: company,
        email: email ?? undefined,
        company,
        message: `Stripe deposit paid — ${productId}`,
        vertical: 'solar',
      });
      recordSignature(inbound.ticket.id, {
        crmType: session.metadata?.crmType,
        calendarLink: session.metadata?.calendarLink,
      });
      return { handled: true, message: `Sovereign sale → K3 deploy — ${session.id}`, lane: 'sovereign' };
    }
    return { handled: true, message: 'Sovereign checkout expired', lane: 'sovereign' };
  }

  // 33333 — consumer Payment Links (brand metadata)
  if (brand) {
    const result = handleStripeEvent({
      type: event.type,
      data: { object: session as unknown as Record<string, unknown> },
    });
    return { ...result, lane: '33333' };
  }

  return { handled: true, message: 'Ignored — no lane metadata (productId or brand)', lane: 'none' };
}

/**
 * Single Stripe webhook for all revenue lanes.
 * Stripe Dashboard → https://autopilot.moneymagnettools.com/api/webhooks/stripe
 *
 * Routes by session metadata:
 * - productId: money-autopilot-engine → Outreach ($197)
 * - productId: sovereign-* → Sovereign Solar B2B
 * - brand → 33333 consumer Payment Links
 */
export function registerUnifiedStripeWebhook(app: Express): void {
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = req.headers['stripe-signature'] as string | undefined;

    const parsed = await parseStripeEvent(rawBody, signature);
    if ('error' in parsed) {
      return res.status(400).json({ handled: false, message: parsed.error });
    }

    try {
      const result = await dispatchEvent(parsed.event);
      res.status(result.handled ? 200 : 400).json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });
}

export { isStripeConfigured };
