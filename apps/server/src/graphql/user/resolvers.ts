import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import { UpdateUserInput } from './inputSchemas';
import { getOnboardingProgress } from './lib/getOnboardingProgress';

type UserParent = {
  fullName: string | null;
  supabaseId: string;
};

export const userResolvers = {
  User: {
    onboardingProgress: (parent: UserParent) => getOnboardingProgress(parent),
  },

  Query: {
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
