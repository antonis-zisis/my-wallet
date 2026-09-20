import { GraphQLError } from 'graphql';

import { env } from '../../lib/env';
import { entitlementsForPlan } from '../../lib/plans';
import prisma from '../../lib/prisma';
import { parseInput, PLANS } from '../../lib/validate';
import { SelectPlanInput, UpdateUserInput } from './inputSchemas';
import { getOnboardingProgress } from './lib/getOnboardingProgress';
import { getPlanUsage } from './lib/getPlanUsage';

type UserParent = {
  fullName: string | null;
  plan: string | null;
  supabaseId: string;
};

export const userResolvers = {
  User: {
    entitlements: (parent: UserParent) => entitlementsForPlan(parent.plan),
    onboardingProgress: (parent: UserParent) => getOnboardingProgress(parent),
  },

  Query: {
    plans: () =>
      PLANS.map((plan) => ({ plan, entitlements: entitlementsForPlan(plan) })),

    planUsage: (
      _parent: unknown,
      _args: unknown,
      context: { userId: string }
    ) => getPlanUsage(context.userId),

    me: async (
      _parent: unknown,
      _args: unknown,
      context: { userId: string; email: string }
    ) => {
      return prisma.user.upsert({
        where: { supabaseId: context.userId },
        update: { email: context.email },
        create: {
          supabaseId: context.userId,
          email: context.email,
        },
      });
    },
  },

  Mutation: {
    updateMe: async (
      _parent: unknown,
      { input }: { input: unknown },
      context: { userId: string }
    ) => {
      const user = await prisma.user.findUnique({
        where: { supabaseId: context.userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const data = parseInput(UpdateUserInput, input);

      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: {
          ...(data.fullName !== undefined && {
            fullName: data.fullName || null,
          }),
          ...(data.currency !== undefined && { currency: data.currency }),
        },
      });
    },

    selectPlan: async (
      _parent: unknown,
      { input }: { input: unknown },
      context: { userId: string }
    ) => {
      const data = parseInput(SelectPlanInput, input);

      if (data.plan === 'PRO' && !env.ENABLE_SELF_SERVE_PLAN_SWITCH) {
        throw new GraphQLError('Pro is not available yet', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: { plan: data.plan },
      });
    },

    completeOnboarding: async (
      _parent: unknown,
      _args: unknown,
      context: { userId: string }
    ) => {
      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: { onboardingCompletedAt: new Date() },
      });
    },

    resetOnboarding: async (
      _parent: unknown,
      _args: unknown,
      context: { userId: string }
    ) => {
      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: { onboardingCompletedAt: null },
      });
    },
  },
};
