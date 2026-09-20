import type { Request, Response } from 'express';

import { handleStripeWebhook } from '../lib/billing/handleStripeWebhook';

export async function stripeWebhookHandler(req: Request, res: Response) {
  try {
    const result = await handleStripeWebhook({
      payload: req.body as Buffer,
      signature: req.headers['stripe-signature'] as string | undefined,
    });

    res.status(result.status).json(result.body);
  } catch {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
