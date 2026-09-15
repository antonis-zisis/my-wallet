import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';

export const healthResolvers = {
  Query: {
    health: async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        throw new GraphQLError('Service unavailable', {
          extensions: { code: 'SERVICE_UNAVAILABLE' },
        });
      }

      return 'GraphQL server is running!';
    },
  },
};
