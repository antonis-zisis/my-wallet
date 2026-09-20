import type Stripe from 'stripe';

import prisma from '../prisma';
import { requireStripe } from '../stripe';
import {
  applyStripeSubscription,
  customerIdOf,
} from './applyStripeSubscription';

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const { subscription } = event.data.object;
      const subscriptionId =
        typeof subscription === 'string' ? subscription : subscription?.id;

      if (!subscriptionId) {
        return;
      }

      await applyStripeSubscription(
        await requireStripe().subscriptions.retrieve(subscriptionId)
      );

      return;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await applyStripeSubscription(event.data.object);

      return;
    }

    case 'invoice.payment_failed': {
      const customerId = customerIdOf(event.data.object.customer);

      if (!customerId) {
        return;
      }

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { planStatus: 'PAST_DUE' },
      });

      return;
    }

    default:
      return;
  }
}
