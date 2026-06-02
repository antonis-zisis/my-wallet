import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import {
  BILLING_CYCLES,
  clampPage,
  validateAmount,
  validateDate,
  validateEnum,
  validateMaxLength,
  validateUrl,
} from '../../lib/validate';

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  notes?: string;
  paymentMethod?: string;
  url?: string;
}

export interface UpdateSubscriptionInput {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  notes?: string;
  paymentMethod?: string;
  url?: string;
}

type SubscriptionParent = {
  amount: number;
  billingCycle: string;
  isActive: boolean;
  cancelledAt: Date | null;
  endDate: Date | null;
};

function computeMonthlyCost(subscription: {
  amount: number;
  billingCycle: string;
}): number {
  switch (subscription.billingCycle) {
    case 'WEEKLY':
      return subscription.amount * (52 / 12);
    case 'QUARTERLY':
      return subscription.amount / 3;
    case 'BI_ANNUAL':
      return subscription.amount / 6;
    case 'YEARLY':
      return subscription.amount / 12;
    default:
      return subscription.amount;
  }
}

function getNextRenewalDate(startDate: Date, billingCycle: string): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const next = new Date(startDate);

  if (billingCycle === 'WEEKLY') {
    while (next <= today) {
      next.setDate(next.getDate() + 7);
    }
  } else {
    const increment =
      billingCycle === 'YEARLY'
        ? 12
        : billingCycle === 'BI_ANNUAL'
          ? 6
          : billingCycle === 'QUARTERLY'
            ? 3
            : 1;
    while (next <= today) {
      next.setMonth(next.getMonth() + increment);
    }
  }

  return next;
}

export const subscriptionResolvers = {
  Subscription: {
    monthlyCost: (parent: SubscriptionParent) => computeMonthlyCost(parent),
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
        sortBy = 'NAME',
        sortOrder = 'ASC',
      }: {
        active?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: 'NAME' | 'MONTHLY_COST' | 'NEXT_RENEWAL';
        sortOrder?: 'ASC' | 'DESC';
      },
      { userId }: { userId: string }
    ) => {
      const now = new Date();
      const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
      const skip = (clampedPage - 1) * clampedPageSize;
      const order = sortOrder === 'ASC' ? 'asc' : 'desc';

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

      if (sortBy === 'MONTHLY_COST') {
        const [allItems, totalCount] = await Promise.all([
          prisma.subscription.findMany({ where }),
          prisma.subscription.count({ where }),
        ]);

        allItems.sort((left, right) => {
          const diff = computeMonthlyCost(left) - computeMonthlyCost(right);

          return sortOrder === 'ASC' ? diff : -diff;
        });

        return {
          items: allItems.slice(skip, skip + clampedPageSize),
          totalCount,
        };
      }

      const orderBy =
        sortBy === 'NEXT_RENEWAL'
          ? { startDate: order as 'asc' | 'desc' }
          : { name: order as 'asc' | 'desc' };

      const [items, totalCount] = await Promise.all([
        prisma.subscription.findMany({
          where,
          orderBy,
          skip,
          take: clampedPageSize,
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
      validateMaxLength(input.name, 'Name', 255);
      validateAmount(input.amount);
      validateEnum(input.billingCycle, BILLING_CYCLES, 'Billing cycle');
      const startDate = validateDate(input.startDate);
      const endDate = input.endDate ? validateDate(input.endDate) : null;
      const trialEndsAt = input.trialEndsAt
        ? validateDate(input.trialEndsAt)
        : null;
      if (input.notes) {
        validateMaxLength(input.notes, 'Notes', 1000);
      }

      if (input.paymentMethod) {
        validateMaxLength(input.paymentMethod, 'Payment method', 255);
      }

      if (input.url) {
        validateUrl(input.url);
      }

      return prisma.subscription.create({
        data: {
          name: input.name,
          amount: input.amount,
          billingCycle: input.billingCycle,
          startDate,
          endDate,
          trialEndsAt,
          notes: input.notes ?? null,
          paymentMethod: input.paymentMethod ?? null,
          url: input.url ?? null,
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

      validateMaxLength(input.name, 'Name', 255);
      validateAmount(input.amount);
      validateEnum(input.billingCycle, BILLING_CYCLES, 'Billing cycle');
      const startDate = validateDate(input.startDate);
      const endDate = input.endDate ? validateDate(input.endDate) : null;
      const trialEndsAt = input.trialEndsAt
        ? validateDate(input.trialEndsAt)
        : null;
      if (input.notes) {
        validateMaxLength(input.notes, 'Notes', 1000);
      }

      if (input.paymentMethod) {
        validateMaxLength(input.paymentMethod, 'Payment method', 255);
      }

      if (input.url) {
        validateUrl(input.url);
      }

      return prisma.subscription.update({
        where: { id: input.id },
        data: {
          name: input.name,
          amount: input.amount,
          billingCycle: input.billingCycle,
          startDate,
          endDate,
          trialEndsAt,
          notes: input.notes ?? null,
          paymentMethod: input.paymentMethod ?? null,
          url: input.url ?? null,
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

      if (input.amount !== undefined) {
        validateAmount(input.amount);
      }

      if (input.billingCycle) {
        validateEnum(input.billingCycle, BILLING_CYCLES, 'Billing cycle');
      }

      const resumeStartDate = input.startDate
        ? validateDate(input.startDate)
        : undefined;

      return prisma.subscription.update({
        where: { id: input.id },
        data: {
          isActive: true,
          cancelledAt: null,
          endDate: null,
          ...(resumeStartDate && { startDate: resumeStartDate }),
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
