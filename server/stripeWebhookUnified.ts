import express, { type Express } from 'express';
import { handleStripeWebhook as handleEngineCheckoutWebhook } from './checkout.js';
import { handleStripeEvent, verifyStripeSignature } from './33333/stripeWebhook.js';

/**
 * Single Stripe webhook for Engine checkout ($197) + 33333 payment links.
 * Stripe Dashboard → https://autopilot.moneymagnettools.com/api/webhooks/stripe
 */
export function registerUnifiedStripeWebhook(app: Express): void {
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = req.headers['stripe-signature'] as string | undefined;

    const engineResult = await handleEngineCheckoutWebhook(rawBody, signature);
    if (engineResult.message.startsWith('Engine sale')) {
      return res.json(engineResult);
    }
    if (engineResult.message.includes('signature verification failed')) {
      return res.status(400).json(engineResult);
    }

    if (!verifyStripeSignature(rawBody, signature)) {
      return res.status(400).json({ error: 'Invalid Stripe signature' });
    }

    try {
      const event = JSON.parse(rawBody.toString('utf8')) as {
        type: string;
        data: { object: Record<string, unknown> };
      };
      const result = handleStripeEvent(event);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });
}
