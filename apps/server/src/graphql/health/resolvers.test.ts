import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { healthResolvers } from './resolvers';

vi.mock('../../lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('healthResolvers.Query.health', () => {
  it('reports that the server is running when the database answers', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]);

    const result = await healthResolvers.Query.health();

    expect(result).toBe('GraphQL server is running!');
  });

  it('reports unavailable when the database cannot be reached', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error('max clients reached')
    );

    await expect(healthResolvers.Query.health()).rejects.toThrow(GraphQLError);
  });

  it('does not leak the database error to the client', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error('max clients reached in session mode')
    );

    await expect(healthResolvers.Query.health()).rejects.toThrow(
      'Service unavailable'
    );
  });
});
