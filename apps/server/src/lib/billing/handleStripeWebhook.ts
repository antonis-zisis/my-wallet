import type Stripe from 'stripe';

import { env } from '../env';
import { stripe } from '../stripe';
import { handleStripeEvent } from './handleStripeEvent';
import { recordStripeEvent } from './recordStripeEvent';

type HandleStripeWebhookInput = {
  payload: Buffer | string;
  signature: string | undefined;
};

type StripeWebhookResult = {
  body: Record<string, unknown>;
  status: number;
};

export async function handleStripeWebhook({
  payload,
  signature,
}: HandleStripeWebhookInput): Promise<StripeWebhookResult> {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return { status: 503, body: { error: 'Billing is not configured' } };
  }

  if (!signature) {
    return { status: 400, body: { error: 'Missing signature' } };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return { status: 400, body: { error: 'Invalid signature' } };
  }

  const isFirstDelivery = await recordStripeEvent({
    id: event.id,
    type: event.type,
  });

  if (!isFirstDelivery) {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  await handleStripeEvent(event);

  return { status: 200, body: { received: true } };
}
