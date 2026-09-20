import { ApolloServer } from '@apollo/server';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

const server = new ApolloServer({ typeDefs, resolvers });
const contextValue = { userId: 'user-1', email: 'owner@example.com' };

let prisma: typeof import('../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../lib/prisma')).default;
});

afterAll(async () => {
  await server.stop();
});

describe('merged GraphQL schema', () => {
  it('resolves the onboarding progress of the signed-in user', async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue(makeUser());
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(null);

    const response = await server.executeOperation(
      { query: '{ me { onboardingProgress { hasFullName hasTransaction } } }' },
      { contextValue }
    );

    expect(
      response.body.kind === 'single' && response.body.singleResult.data
    ).toEqual({
      me: { onboardingProgress: { hasFullName: true, hasTransaction: false } },
    });
  });

  it('registers the computed fields every domain contributes', () => {
    expect(resolvers.Report.members).toBeInstanceOf(Function);
    expect(resolvers.Subscription.isActive).toBeInstanceOf(Function);
    expect(resolvers.Contract.isExpired).toBeInstanceOf(Function);
    expect(resolvers.NetWorthSnapshot.entries).toBeInstanceOf(Function);
    expect(resolvers.User.onboardingProgress).toBeInstanceOf(Function);
  });
});
