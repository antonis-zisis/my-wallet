import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscriptionResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

const mockSubscription = {
  id: 'sub-1',
  name: 'Netflix',
  amount: 15.99,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: new Date('2025-01-01T00:00:00Z'),
  endDate: null,
  userId: USER_ID,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

const mockYearlySubscription = {
  id: 'sub-2',
  name: 'YouTube Premium',
  amount: 120,
  billingCycle: 'YEARLY',
  isActive: true,
  startDate: new Date('2025-03-01T00:00:00Z'),
  endDate: new Date('2026-03-01T00:00:00Z'),
  userId: USER_ID,
  createdAt: new Date('2025-03-01T00:00:00Z'),
  updatedAt: new Date('2025-03-01T00:00:00Z'),
};

vi.mock('../../lib/prisma', () => ({
  default: {
    subscription: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('subscriptionResolvers', () => {
  describe('Subscription.monthlyCost', () => {
    it('returns amount as-is for monthly subscriptions', () => {
      const result = subscriptionResolvers.Subscription.monthlyCost({
        amount: 15.99,
        billingCycle: 'MONTHLY',
      });

      expect(result).toBe(15.99);
    });

    it('returns amount / 12 for yearly subscriptions', () => {
      const result = subscriptionResolvers.Subscription.monthlyCost({
        amount: 120,
        billingCycle: 'YEARLY',
      });

      expect(result).toBe(10);
    });
  });

  describe('Query.subscriptions', () => {
    it('returns items and totalCount for page 1', async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([
        mockSubscription as never,
      ]);
      vi.mocked(prisma.subscription.count).mockResolvedValue(1);

      const result = await subscriptionResolvers.Query.subscriptions(
        undefined as unknown,
        { page: 1 },
        CTX
      );

      expect(prisma.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({
        items: [mockSubscription],
        totalCount: 1,
      });
    });

    it('skips 20 items for page 2', async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([]);
      vi.mocked(prisma.subscription.count).mockResolvedValue(21);

      await subscriptionResolvers.Query.subscriptions(
        undefined as unknown,
        { page: 2 },
        CTX
      );

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
    });

    it('defaults to page 1 when page is not provided', async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([]);
      vi.mocked(prisma.subscription.count).mockResolvedValue(0);

      await subscriptionResolvers.Query.subscriptions(
        undefined as unknown,
        {},
        CTX
      );

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 })
      );
    });

    it('filters by isActive when active param is provided', async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([]);
      vi.mocked(prisma.subscription.count).mockResolvedValue(0);

      await subscriptionResolvers.Query.subscriptions(
        undefined as unknown,
        { active: true },
        CTX
      );

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, isActive: true },
        })
      );
    });

    it('does not filter by isActive when active param is undefined', async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([]);
      vi.mocked(prisma.subscription.count).mockResolvedValue(0);

      await subscriptionResolvers.Query.subscriptions(
        undefined as unknown,
        {},
        CTX
      );

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
        })
      );
    });
  });

  describe('Mutation.createSubscription', () => {
    it('creates a subscription with correct data', async () => {
      vi.mocked(prisma.subscription.create).mockResolvedValue(
        mockSubscription as never
      );

      const result = await subscriptionResolvers.Mutation.createSubscription(
        undefined as unknown,
        {
          input: {
            name: 'Netflix',
            amount: 15.99,
            billingCycle: 'MONTHLY',
            startDate: '2025-01-01',
          },
        },
        CTX
      );

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: {
          name: 'Netflix',
          amount: 15.99,
          billingCycle: 'MONTHLY',
          startDate: new Date('2025-01-01'),
          endDate: null,
          userId: USER_ID,
        },
      });
      expect(result).toEqual(mockSubscription);
    });

    it('creates a subscription with an end date', async () => {
      vi.mocked(prisma.subscription.create).mockResolvedValue(
        mockYearlySubscription as never
      );

      await subscriptionResolvers.Mutation.createSubscription(
        undefined as unknown,
        {
          input: {
            name: 'YouTube Premium',
            amount: 120,
            billingCycle: 'YEARLY',
            startDate: '2025-03-01',
            endDate: '2026-03-01',
          },
        },
        CTX
      );

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          endDate: new Date('2026-03-01'),
        }),
      });
    });
  });

  describe('Mutation.updateSubscription', () => {
    it('updates a subscription after authorization check', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        mockSubscription as never
      );
      vi.mocked(prisma.subscription.update).mockResolvedValue({
        ...mockSubscription,
        name: 'Netflix Premium',
      } as never);

      const result = await subscriptionResolvers.Mutation.updateSubscription(
        undefined as unknown,
        {
          input: {
            id: 'sub-1',
            name: 'Netflix Premium',
            amount: 22.99,
            billingCycle: 'MONTHLY',
            startDate: '2025-01-01',
          },
        },
        CTX
      );

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { id: 'sub-1', userId: USER_ID },
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          name: 'Netflix Premium',
          amount: 22.99,
          billingCycle: 'MONTHLY',
          startDate: new Date('2025-01-01'),
          endDate: null,
        },
      });
      expect(result).toEqual(
        expect.objectContaining({ name: 'Netflix Premium' })
      );
    });

    it('throws NOT_FOUND error when subscription does not belong to user', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        subscriptionResolvers.Mutation.updateSubscription(
          undefined as unknown,
          {
            input: {
              id: 'other-sub',
              name: 'Test',
              amount: 10,
              billingCycle: 'MONTHLY',
              startDate: '2025-01-01',
            },
          },
          CTX
        )
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('Mutation.cancelSubscription', () => {
    it('sets isActive to false', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        mockSubscription as never
      );
      vi.mocked(prisma.subscription.update).mockResolvedValue({
        ...mockSubscription,
        isActive: false,
      } as never);

      const result = await subscriptionResolvers.Mutation.cancelSubscription(
        undefined as unknown,
        { id: 'sub-1' },
        CTX
      );

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { id: 'sub-1', userId: USER_ID },
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { isActive: false },
      });
      expect(result).toEqual(expect.objectContaining({ isActive: false }));
    });

    it('throws NOT_FOUND error when subscription does not belong to user', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        subscriptionResolvers.Mutation.cancelSubscription(
          undefined as unknown,
          { id: 'other-sub' },
          CTX
        )
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('Mutation.deleteSubscription', () => {
    it('deletes a subscription and returns true', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        mockSubscription as never
      );
      vi.mocked(prisma.subscription.delete).mockResolvedValue(
        mockSubscription as never
      );

      const result = await subscriptionResolvers.Mutation.deleteSubscription(
        undefined as unknown,
        { id: 'sub-1' },
        CTX
      );

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { id: 'sub-1', userId: USER_ID },
      });
      expect(prisma.subscription.delete).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
      });
      expect(result).toBe(true);
    });

    it('throws NOT_FOUND error when subscription does not belong to user', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        subscriptionResolvers.Mutation.deleteSubscription(
          undefined as unknown,
          { id: 'other-sub' },
          CTX
        )
      ).rejects.toThrow('Subscription not found');
    });
  });
});
