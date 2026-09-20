import type Stripe from 'stripe';

import prisma from '../prisma';

type PlanStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

const PLAN_STATUS_BY_STRIPE_STATUS: Record<string, PlanStatus> = {
  active: 'ACTIVE',
  trialing: 'TRIALING',
  past_due: 'PAST_DUE',
  canceled: 'CANCELED',
  incomplete: 'CANCELED',
  incomplete_expired: 'CANCELED',
  paused: 'CANCELED',
  unpaid: 'CANCELED',
};

export function planStatusFor(stripeStatus: string): PlanStatus {
  return PLAN_STATUS_BY_STRIPE_STATUS[stripeStatus] ?? 'CANCELED';
}

export function customerIdOf(
  customer: string | { id: string } | null
): string | null {
  if (!customer) {
    return null;
  }

  return typeof customer === 'string' ? customer : customer.id;
}

export async function applyStripeSubscription(
  subscription: Stripe.Subscription
): Promise<number> {
  const customerId = customerIdOf(subscription.customer);

  if (!customerId) {
    return 0;
  }

  const planStatus = planStatusFor(subscription.status);
  const isEntitled = planStatus !== 'CANCELED';
  const periodEnd = subscription.items.data[0]?.current_period_end;

  const { count } = await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: isEntitled ? 'PRO' : 'FREE',
      planStatus,
      planRenewsAt: isEntitled && periodEnd ? new Date(periodEnd * 1000) : null,
      planCancelAtPeriodEnd: isEntitled
        ? subscription.cancel_at_period_end
        : false,
      stripeSubscriptionId: isEntitled ? subscription.id : null,
    },
  });

  return count;
}
