import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import {
  BILLING_CYCLES,
  validateAmount,
  validateDate,
  validateEnum,
  validateMaxLength,
  validateUrl,
} from '../../lib/validate';
import { getNextRenewalDate } from './lib/getNextRenewalDate';

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

export interface ResumeSubscriptionInput {
  id: string;
  startDate?: string;
  amount?: number;
  billingCycle?: string;
}

export const subscriptionMutationResolvers = {
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
    { input }: { input: ResumeSubscriptionInput },
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
};
