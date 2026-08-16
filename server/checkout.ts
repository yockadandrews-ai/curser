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

export const ENGINE_PRODUCT = {
  id: 'money-autopilot-engine',
  name: 'Money Autopilot Engine',
  description: 'Background automation — discover winning products, generate viral content, queue posts with human approval gates.',
  priceCents: 19700,
  currency: 'usd',
} as const;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY || null;
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

function getToolsBaseUrl(): string {
  return (process.env.TOOLS_BASE_URL || 'https://tools.moneymagnettools.com').replace(/\/$/, '');
}

export async function createEngineCheckoutSession(input: {
  email?: string;
  customerName?: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const successUrl = `${getToolsBaseUrl()}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${getToolsBaseUrl()}/autopilot-landing.html#pricing`;

  if (input.email) {
    subscribeOutreach({ email: input.email, name: input.customerName, source: 'checkout' });
  }

  const priceId = process.env.STRIPE_PRICE_ID_ENGINE;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: ENGINE_PRODUCT.currency,
          unit_amount: ENGINE_PRODUCT.priceCents,
          product_data: {
            name: ENGINE_PRODUCT.name,
            description: ENGINE_PRODUCT.description,
          },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: input.email,
    metadata: {
      productId: ENGINE_PRODUCT.id,
      productName: ENGINE_PRODUCT.name,
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  if (input.email) {
    const payload: OutreachEventPayload = {
      type: 'checkout_started',
      email: input.email,
      name: input.customerName,
      productName: ENGINE_PRODUCT.name,
      sessionId: session.id,
      approveUrl: buildApproveUrl(),
      dashboardUrl: getAppBaseUrl(),
      timestamp: new Date().toISOString(),
    };
    await dispatchOutreachWebhook(payload);
  }

  return { url: session.url, sessionId: session.id };
}

export async function handleEngineCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<{ handled: boolean; message: string }> {
  if (session.metadata?.productId !== ENGINE_PRODUCT.id) {
    return { handled: false, message: 'Not Engine product' };
  }

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

  return { handled: true, message: `Engine sale recorded — ${session.id}` };
}

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ handled: boolean; message: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { handled: false, message: 'STRIPE_WEBHOOK_SECRET not configured' };
  }
  if (!signature) {
    return { handled: false, message: 'Missing stripe-signature header' };
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    return { handled: false, message: `Webhook signature verification failed: ${String(e)}` };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      return handleEngineCheckoutCompleted(session);
    }
    default:
      return { handled: true, message: `Unhandled event type: ${event.type}` };
  }
}

export async function getCheckoutSessionStatus(sessionId: string): Promise<{
  status: string;
  email?: string;
  paid: boolean;
  approveUrl: string;
  dashboardUrl: string;
}> {
  if (!isStripeConfigured()) {
    return {
      status: 'unconfigured',
      paid: false,
      approveUrl: buildApproveUrl(),
      dashboardUrl: getAppBaseUrl(),
    };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = session.customer_details?.email || session.customer_email || undefined;

  return {
    status: session.status ?? 'unknown',
    email: email ?? undefined,
    paid: session.payment_status === 'paid',
    approveUrl: buildApproveUrl(),
    dashboardUrl: getAppBaseUrl(),
  };
}
