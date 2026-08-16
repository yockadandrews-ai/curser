import Stripe from 'stripe';
import {
  subscribeOutreach,
  linkStripeCustomer,
  dispatchOutreachWebhook,
  buildApproveUrl,
  getAppBaseUrl,
  type OutreachEventPayload,
} from './outreach.js';
import { recordExternalRevenue } from './profitTracker.js';
import { ingestHermesSignal } from './hermes/orchestrator.js';
import { ENGINE_PRODUCT } from './checkout.js';
import { handleStripeEvent } from './33333/stripeWebhook.js';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

/**
 * Unified Stripe webhook — routes by metadata:
 * - productId=money-autopilot-engine → Outreach lane ($197 Engine)
 * - brand=vaultverse|aurascript|... → 33333 consumer lane
 * - SGOS/Hermes ingests Engine sales only; 33333 stays consumer-only
 */
export async function dispatchStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ handled: boolean; message: string; lane?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return { handled: false, message: 'STRIPE_WEBHOOK_SECRET not configured' };
  }
  if (!signature) {
    return { handled: false, message: 'Missing stripe-signature header' };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { handled: false, message: 'STRIPE_SECRET_KEY not configured' };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    return { handled: false, message: `Webhook signature verification failed: ${String(e)}` };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};

    if (metadata.productId === ENGINE_PRODUCT.id) {
      return handleEngineCheckoutCompleted(session);
    }

    if (metadata.brand) {
      const result = handleStripeEvent({
        type: event.type,
        data: { object: session as unknown as Record<string, unknown> },
      });
      return { ...result, lane: '33333' };
    }

    return { handled: true, message: 'Ignored — no lane metadata', lane: 'none' };
  }

  if (event.type === 'checkout.session.expired') {
    const result = handleStripeEvent({
      type: event.type,
      data: { object: event.data.object as unknown as Record<string, unknown> },
    });
    return { ...result, lane: '33333' };
  }

  return { handled: true, message: `Unhandled event type: ${event.type}`, lane: 'none' };
}

async function handleEngineCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<{ handled: boolean; message: string; lane: string }> {
  const email = session.customer_details?.email || session.customer_email || undefined;
  const amount = (session.amount_total ?? ENGINE_PRODUCT.priceCents) / 100;

  if (email) {
    subscribeOutreach({ email, source: 'stripe' });
    if (typeof session.customer === 'string') {
      linkStripeCustomer(email, session.customer);
    }
  }

  recordExternalRevenue({
    source: 'stripe',
    amount,
    description: `${ENGINE_PRODUCT.name} — ${session.id}`,
    cost: 0,
  });

  ingestHermesSignal({
    source: 'stripe_sale',
    title: `Sale: ${ENGINE_PRODUCT.name}`,
    summary: email ? `Customer: ${email}` : `Session: ${session.id}`,
    productSlug: ENGINE_PRODUCT.id,
    payload: { sessionId: session.id, email, amount, source: 'Stripe' },
  });

  const payload: OutreachEventPayload = {
    type: 'checkout_completed',
    email,
    productName: ENGINE_PRODUCT.name,
    amount,
    currency: session.currency ?? 'usd',
    sessionId: session.id,
    approveUrl: buildApproveUrl(),
    dashboardUrl: getAppBaseUrl(),
    timestamp: new Date().toISOString(),
  };
  await dispatchOutreachWebhook(payload);

  return { handled: true, message: `Engine sale recorded — ${session.id}`, lane: 'outreach' };
}
