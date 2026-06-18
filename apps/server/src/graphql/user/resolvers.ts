import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { validateMaxLength } from '../../lib/validate';

export type UpdateUserInput = {
  fullName?: string;
};

export const userResolvers = {
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
      { input }: { input: UpdateUserInput },
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

      const fullName = input.fullName?.trim();
      if (fullName) {
        validateMaxLength(fullName, 'Full name', 255);
      }

      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: { fullName: fullName ?? null },
      });
    },
  },
};
