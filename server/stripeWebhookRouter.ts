/**
 * Unified Stripe webhook — dispatches by session metadata to the correct revenue lane.
 *
 * Lanes:
 * - Outreach ($197 Engine): metadata.productId === 'money-autopilot-engine'
 * - 33333 consumer: metadata.brand present
 * - Sovereign Solar ($15K): metadata.productId starts with 'sovereign-' (future Payment Link metadata)
 */

import express, { type Express } from 'express';
import Stripe from 'stripe';
import { handleEngineCheckoutCompleted, ENGINE_PRODUCT, isStripeConfigured } from './checkout.js';

function getStripeForWebhook(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

async function dispatchStripeEvent(event: Stripe.Event): Promise<{ handled: boolean; message: string; lane?: string }> {
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId;
    const brand = session.metadata?.brand;

    // Outreach lane — $197 Engine (Checkout Session API)
    if (productId === ENGINE_PRODUCT.id) {
      if (event.type === 'checkout.session.completed') {
        const result = await handleEngineCheckoutCompleted(session);
        return { ...result, lane: 'outreach' };
      }
      return { handled: true, message: 'Engine checkout expired — no action', lane: 'outreach' };
    }

    // 33333 consumer lane — Payment Links with brand metadata
    if (brand) {
      const { handleStripeEvent } = await import('./33333/stripeWebhook.js');
      const result = handleStripeEvent({
        type: event.type,
        data: { object: session as unknown as Record<string, unknown> },
      });
      return { ...result, lane: '33333' };
    }

    // Sovereign lane — high-ticket B2B (Payment Links; wire metadata on Stripe dashboard)
    if (productId?.startsWith('sovereign-')) {
      const { ingestInbound, recordSignature } = await import('./sovereign/loop.js');
      const email = session.customer_details?.email || session.customer_email;
      const company = session.metadata?.company || email || 'Solar client';

      if (event.type === 'checkout.session.completed') {
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

        return { handled: true, message: `Sovereign sale → K3 deploy triggered — ${session.id}`, lane: 'sovereign' };
      }
      return { handled: true, message: 'Sovereign checkout expired', lane: 'sovereign' };
    }

    return { handled: true, message: 'Ignored — no lane metadata (productId or brand)', lane: 'none' };
  }

  return { handled: false, message: `Unhandled event type: ${event.type}` };
}

export async function handleUnifiedStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ handled: boolean; message: string; lane?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { handled: false, message: 'STRIPE_WEBHOOK_SECRET not configured' };
  }
  if (!signature) {
    return { handled: false, message: 'Missing stripe-signature header' };
  }

  let event: Stripe.Event;
  const stripe = getStripeForWebhook();

  if (stripe) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (e) {
      return { handled: false, message: `Webhook signature verification failed: ${String(e)}` };
    }
  } else {
    // Fallback: 33333 HMAC verify when STRIPE_SECRET_KEY not set (Payment Links only)
    const { verifyStripeSignature } = await import('./33333/stripeWebhook.js');
    if (!verifyStripeSignature(rawBody, signature)) {
      return { handled: false, message: 'Invalid Stripe signature' };
    }
    try {
      event = JSON.parse(rawBody.toString('utf8')) as Stripe.Event;
    } catch {
      return { handled: false, message: 'Invalid JSON body' };
    }
  }

  return dispatchStripeEvent(event);
}

export function registerUnifiedStripeWebhook(app: Express): void {
  app.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const result = await handleUnifiedStripeWebhook(
          req.body as Buffer,
          req.headers['stripe-signature'] as string | undefined,
        );
        res.status(result.handled ? 200 : 400).json(result);
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    },
  );
}

export { isStripeConfigured };
