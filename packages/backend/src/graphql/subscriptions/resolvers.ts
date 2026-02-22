import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';

const PAGE_SIZE = 20;

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
};

export const subscriptionResolvers = {
  Subscription: {
    monthlyCost: (parent: SubscriptionParent) => {
      return parent.billingCycle === 'YEARLY'
        ? parent.amount / 12
        : parent.amount;
    },
  },
  Query: {
    subscriptions: async (
      _parent: unknown,
      { page = 1, active }: { page?: number; active?: boolean },
      { userId }: { userId: string }
    ) => {
      const where: { userId: string; isActive?: boolean } = { userId };
      if (active !== undefined) {
        where.isActive = active;
      }
      const skip = (page - 1) * PAGE_SIZE;
      const [items, totalCount] = await Promise.all([
        prisma.subscription.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: PAGE_SIZE,
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
      return prisma.subscription.update({
        where: { id },
        data: { isActive: false },
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
