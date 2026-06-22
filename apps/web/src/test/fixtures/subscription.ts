import { Subscription } from '../../types/subscription';

export function makeSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: 'subscription-1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'MONTHLY',
    isActive: true,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: null,
    cancelledAt: null,
    trialEndsAt: null,
    category: null,
    notes: null,
    paymentMethod: null,
    url: null,
    monthlyCost: 15.99,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}
