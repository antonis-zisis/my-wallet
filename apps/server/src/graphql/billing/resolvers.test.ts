import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createCheckoutSession,
  createCustomer,
  createPortalSession,
  retrievePrice,
} = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn(),
  createCustomer: vi.fn(),
  retrievePrice: vi.fn(),
}));

vi.mock('../../lib/env', () => ({
  env: {
    APP_URL: 'https://wallet.test',
    STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
    STRIPE_PRICE_ID_YEARLY: 'price_yearly',
  },
}));

vi.mock('../../lib/stripe', () => {
  const client = {
    checkout: { sessions: { create: createCheckoutSession } },
    billingPortal: { sessions: { create: createPortalSession } },
    customers: { create: createCustomer },
    prices: { retrieve: retrievePrice },
  };

  return { stripe: client, requireStripe: () => client };
});

vi.mock('../../lib/prisma', () => ({
  default: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));

import { makeUser } from '../../test/fixtures/users';
import { billingResolvers } from './resolvers';

const CTX = { userId: 'user-1' };

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('billingResolvers', () => {
  describe('Query.planPrices', () => {
    it('returns the configured prices in minor units', async () => {
      retrievePrice.mockImplementation((priceId: string) =>
        priceId === 'price_monthly'
          ? { unit_amount: 400, currency: 'eur' }
          : { unit_amount: 3840, currency: 'eur' }
      );

      const prices = await billingResolvers.Query.planPrices();

      expect(prices).toEqual([
        { amount: 400, currency: 'EUR', interval: 'MONTH' },
        { amount: 3840, currency: 'EUR', interval: 'YEAR' },
      ]);
    });

    it('skips a price with no fixed amount', async () => {
      retrievePrice.mockResolvedValue({ unit_amount: null, currency: 'eur' });

      await expect(billingResolvers.Query.planPrices()).resolves.toEqual([]);
    });
  });

  describe('Mutation.createCheckoutSession', () => {
    it('starts checkout for the price the interval names', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ stripeCustomerId: 'cus_123' })
      );
      createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.test/s',
      });

      const result = await billingResolvers.Mutation.createCheckoutSession(
        undefined,
        { input: { interval: 'YEAR' } },
        CTX
      );

      expect(createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_123',
          client_reference_id: 'user-1',
          line_items: [{ price: 'price_yearly', quantity: 1 }],
          success_url: 'https://wallet.test/select-plan?checkout=success',
        })
      );
      expect(result).toEqual({ url: 'https://checkout.test/s' });
    });

    it('creates the Stripe customer on a first upgrade and stores it', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ stripeCustomerId: null })
      );
      createCustomer.mockResolvedValue({ id: 'cus_new' });
      createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.test/s',
      });

      await billingResolvers.Mutation.createCheckoutSession(
        undefined,
        { input: { interval: 'MONTH' } },
        CTX
      );

      expect(createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { supabaseId: 'user-1' } })
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { supabaseId: 'user-1' },
        data: { stripeCustomerId: 'cus_new' },
      });
    });

    it('rejects an interval that is not a billing interval', async () => {
      const mutation = billingResolvers.Mutation.createCheckoutSession(
        undefined,
        { input: { interval: 'WEEK' } },
        CTX
      );

      await expect(mutation).rejects.toThrow(/Interval must be one of/);
      expect(createCheckoutSession).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.createBillingPortalSession', () => {
    it('opens the portal for the caller own customer record', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ stripeCustomerId: 'cus_123' })
      );
      createPortalSession.mockResolvedValue({ url: 'https://portal.test/s' });

      const result = await billingResolvers.Mutation.createBillingPortalSession(
        undefined,
        undefined,
        CTX
      );

      expect(createPortalSession).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://wallet.test/profile',
      });
      expect(result).toEqual({ url: 'https://portal.test/s' });
    });

    it('throws NOT_FOUND when the caller has never subscribed', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ stripeCustomerId: null })
      );

      const mutation = billingResolvers.Mutation.createBillingPortalSession(
        undefined,
        undefined,
        CTX
      );

      await expect(mutation).rejects.toThrow(
        'You do not have a billing account yet'
      );
      expect(createPortalSession).not.toHaveBeenCalled();
    });
  });
});
