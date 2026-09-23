import { ApolloServer } from '@apollo/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'test-secret';
  process.env.PG_USER = 'user';
  process.env.PG_PASSWORD = 'password';
  process.env.PG_DATABASE = 'wallet';
});

vi.mock('../lib/prisma', () => ({
  default: {
    user: { upsert: vi.fn() },
    transaction: { findFirst: vi.fn() },
    subscription: { findFirst: vi.fn() },
    contract: { findFirst: vi.fn() },
    netWorthSnapshot: { findFirst: vi.fn() },
  },
}));

import { makeUser } from '../test/fixtures/users';
import { resolvers, typeDefs } from './index';

const CTX = { userId: 'user-1', email: 'user@example.com' };

let prisma: typeof import('../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../lib/prisma')).default;
});

async function runQuery(query: string) {
  const server = new ApolloServer({ typeDefs, resolvers });
  const response = await server.executeOperation(
    { query },
    { contextValue: CTX }
  );

  if (response.body.kind !== 'single') {
    throw new Error('Expected a single result');
  }

  return response.body.singleResult;
}

describe('executable schema', () => {
  it('builds from the merged typeDefs and resolvers', async () => {
    const result = await runQuery('{ __typename }');

    expect(result.errors).toBeUndefined();
  });

  it('resolves onboarding progress on the me query', async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue(makeUser());
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: 'transaction-1',
    } as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(null);

    const result = await runQuery(
      '{ me { onboardingProgress { hasTransaction hasSubscription } } }'
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.me).toMatchObject({
      onboardingProgress: { hasTransaction: true, hasSubscription: false },
    });
  });
});
