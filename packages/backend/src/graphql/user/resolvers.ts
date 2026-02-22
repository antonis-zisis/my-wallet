import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';

export interface UpdateUserInput {
  fullName?: string;
}

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

      return prisma.user.update({
        where: { supabaseId: context.userId },
        data: { fullName: input.fullName },
      });
    },
  },
};
