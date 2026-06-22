import { Subscription } from '../../generated/prisma/client';

export function makeSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: 'subscription-1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'MONTHLY',
    isActive: true,
    startDate: new Date('2025-01-01T00:00:00Z'),
    endDate: null,
    cancelledAt: null,
    trialEndsAt: null,
    category: null,
    notes: null,
    paymentMethod: null,
    url: null,
    userId: 'user-1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}
