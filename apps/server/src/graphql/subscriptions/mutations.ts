import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import { ResumeSubscriptionInput, SubscriptionInput } from './inputSchemas';
import { getNextRenewalDate } from './lib/getNextRenewalDate';

export const subscriptionMutationResolvers = {
  createSubscription: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const data = parseInput(SubscriptionInput, input);

    return prisma.subscription.create({
      data: {
        name: data.name,
        amount: data.amount,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
        category: data.category ?? null,
        notes: data.notes ?? null,
        paymentMethod: data.paymentMethod ?? null,
        url: data.url ?? null,
        userId,
      },
    });
  },
  updateSubscription: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { id } = input as { id: string };
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new GraphQLError('Subscription not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const data = parseInput(SubscriptionInput, input);

    return prisma.subscription.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
        category: data.category ?? null,
        notes: data.notes ?? null,
        paymentMethod: data.paymentMethod ?? null,
        url: data.url ?? null,
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
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { id } = input as { id: string };
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new GraphQLError('Subscription not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const data = parseInput(ResumeSubscriptionInput, input);

    return prisma.subscription.update({
      where: { id },
      data: {
        isActive: true,
        cancelledAt: null,
        endDate: null,
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.billingCycle && { billingCycle: data.billingCycle }),
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
};
