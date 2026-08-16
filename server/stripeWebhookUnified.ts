import Stripe from 'stripe';
import { handleStripeEvent, verifyStripeSignature } from './33333/stripeWebhook.js';
import { ENGINE_PRODUCT, isStripeConfigured, processEngineCheckoutSession } from './checkout.js';

function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
}

/** Single Stripe webhook — routes Engine vs 33333 consumer lane by session metadata */
export async function handleUnifiedStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const stripe = getStripe();

  if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature ?? '',
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (e) {
      return { status: 400, body: { error: `Webhook signature verification failed: ${String(e)}` } };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.productId === ENGINE_PRODUCT.id) {
        const result = await processEngineCheckoutSession(session);
        return { status: 200, body: result };
      }
    }

    const result33333 = handleStripeEvent({
      type: event.type,
      data: { object: event.data.object as unknown as Record<string, unknown> },
    });
    if (result33333.handled) {
      return { status: 200, body: result33333 };
    }

    return { status: 200, body: { handled: true, message: `Unhandled event type: ${event.type}` } };
  }

  if (!verifyStripeSignature(rawBody, signature)) {
    return { status: 400, body: { error: 'Invalid Stripe signature' } };
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8')) as {
      type: string;
      data: { object: Record<string, unknown> & { metadata?: Record<string, string> } };
    };

    if (event.type === 'checkout.session.completed' && event.data.object.metadata?.productId === ENGINE_PRODUCT.id) {
      const result = await processEngineCheckoutSession(event.data.object as unknown as Stripe.Checkout.Session);
      return { status: 200, body: result };
    }

    const result = handleStripeEvent(event);
    return { status: 200, body: result };
  } catch (e) {
    return { status: 400, body: { error: String(e) } };
  }
}
