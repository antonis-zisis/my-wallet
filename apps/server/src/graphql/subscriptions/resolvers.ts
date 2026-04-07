import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateSubscriptionInput {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string;
}

type SubscriptionParent = {
  amount: number;
  billingCycle: string;
  isActive: boolean;
  cancelledAt: Date | null;
  endDate: Date | null;
};

function getNextRenewalDate(startDate: Date, billingCycle: string): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const increment = billingCycle === 'YEARLY' ? 12 : 1;
  const next = new Date(startDate);

  while (next <= today) {
    next.setMonth(next.getMonth() + increment);
  }

  return next;
}

export const subscriptionResolvers = {
  Subscription: {
    monthlyCost: (parent: SubscriptionParent) => {
      return parent.billingCycle === 'YEARLY'
        ? parent.amount / 12
        : parent.amount;
    },
    isActive: (parent: SubscriptionParent) => {
      if (parent.cancelledAt) {
        return parent.endDate ? parent.endDate > new Date() : false;
      }

      return parent.isActive;
    },
  },
  Query: {
    subscriptions: async (
      _parent: unknown,
      {
        active,
        page = 1,
        pageSize = 10,
      }: { active?: boolean; page?: number; pageSize?: number },
      { userId }: { userId: string }
    ) => {
      const now = new Date();
      const skip = (page - 1) * pageSize;

      const buildWhere = () => {
        if (active === true) {
          return {
            userId,
            isActive: true,
            OR: [
              { cancelledAt: null },
              { cancelledAt: { not: null }, endDate: { gt: now } },
            ],
          };
        }

        if (active === false) {
          return {
            userId,
            OR: [
              { isActive: false },
              {
                isActive: true,
                cancelledAt: { not: null },
                endDate: { lte: now },
              },
            ],
          };
        }

        return { userId };
      };

      const where = buildWhere();

      const [items, totalCount] = await Promise.all([
        prisma.subscription.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        prisma.subscription.count({ where }),
      ]);

      return { items, totalCount };
    },
  },
  Mutation: {
    createSubscription: async (
      _parent: unknown,
      { input }: { input: CreateSubscriptionInput },
      { userId }: { userId: string }
    ) => {
      return prisma.subscription.create({
        data: {
          name: input.name,
          amount: input.amount,
          billingCycle: input.billingCycle,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
          userId,
        },
      });
    },
    updateSubscription: async (
      _parent: unknown,
      { input }: { input: UpdateSubscriptionInput },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.subscription.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Subscription not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return prisma.subscription.update({
        where: { id: input.id },
        data: {
          name: input.name,
          amount: input.amount,
          billingCycle: input.billingCycle,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
        },
      });
    },
    cancelSubscription: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.subscription.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Subscription not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const endDate =
        existing.endDate ??
        getNextRenewalDate(existing.startDate, existing.billingCycle);

      return prisma.subscription.update({
        where: { id },
        data: { cancelledAt: new Date(), endDate },
      });
    },
    resumeSubscription: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          id: string;
          startDate?: string;
          amount?: number;
          billingCycle?: string;
        };
      },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.subscription.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Subscription not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return prisma.subscription.update({
        where: { id: input.id },
        data: {
          isActive: true,
          cancelledAt: null,
          endDate: null,
          ...(input.startDate && { startDate: new Date(input.startDate) }),
          ...(input.amount !== undefined && { amount: input.amount }),
          ...(input.billingCycle && { billingCycle: input.billingCycle }),
        },
      });
    },
    deleteSubscription: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.subscription.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Subscription not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await prisma.subscription.delete({ where: { id } });

      return true;
    },
  },
};
