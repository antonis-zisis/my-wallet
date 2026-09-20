import type Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyStripeSubscription,
  planStatusFor,
} from './applyStripeSubscription';

vi.mock('../prisma', () => ({
  default: { user: { updateMany: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
  vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 });
});

const PERIOD_END = 1790000000;

function makeSubscription(
  overrides: Partial<Stripe.Subscription> = {}
): Stripe.Subscription {
  return {
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    cancel_at_period_end: false,
    items: { data: [{ current_period_end: PERIOD_END }] },
    ...overrides,
  } as Stripe.Subscription;
}

function dataPassedToPrisma() {
  return vi.mocked(prisma.user.updateMany).mock.calls[0][0].data;
}

describe('planStatusFor', () => {
  it('maps the statuses that keep the subscription alive', () => {
    expect(planStatusFor('active')).toBe('ACTIVE');
    expect(planStatusFor('trialing')).toBe('TRIALING');
    expect(planStatusFor('past_due')).toBe('PAST_DUE');
  });

  it('treats a never-paid or exhausted subscription as cancelled', () => {
    expect(planStatusFor('incomplete')).toBe('CANCELED');
    expect(planStatusFor('unpaid')).toBe('CANCELED');
    expect(planStatusFor('paused')).toBe('CANCELED');
    expect(planStatusFor('something_new')).toBe('CANCELED');
  });
});

describe('applyStripeSubscription', () => {
  it('puts an active subscriber on Pro with their renewal date', async () => {
    await applyStripeSubscription(makeSubscription());

    expect(vi.mocked(prisma.user.updateMany).mock.calls[0][0].where).toEqual({
      stripeCustomerId: 'cus_123',
    });
    expect(dataPassedToPrisma()).toMatchObject({
      plan: 'PRO',
      planStatus: 'ACTIVE',
      planRenewsAt: new Date(PERIOD_END * 1000),
      stripeSubscriptionId: 'sub_123',
    });
  });

  it('keeps Pro while payment is overdue', async () => {
    await applyStripeSubscription(makeSubscription({ status: 'past_due' }));

    expect(dataPassedToPrisma()).toMatchObject({
      plan: 'PRO',
      planStatus: 'PAST_DUE',
    });
  });

  it('drops to Free and forgets the subscription once cancelled', async () => {
    await applyStripeSubscription(makeSubscription({ status: 'canceled' }));

    expect(dataPassedToPrisma()).toMatchObject({
      plan: 'FREE',
      planStatus: 'CANCELED',
      planRenewsAt: null,
      planCancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
    });
  });

  it('records a subscription set to end at the period boundary', async () => {
    await applyStripeSubscription(
      makeSubscription({ cancel_at_period_end: true })
    );

    expect(dataPassedToPrisma()).toMatchObject({
      plan: 'PRO',
      planCancelAtPeriodEnd: true,
    });
  });

  it('ignores a subscription with no customer attached', async () => {
    const count = await applyStripeSubscription(
      makeSubscription({ customer: null as unknown as string })
    );

    expect(count).toBe(0);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
