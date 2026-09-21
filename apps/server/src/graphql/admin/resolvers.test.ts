import type { GraphQLResolveInfo } from 'graphql';
import { parse } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures/users';
import { adminResolvers } from './resolvers';

const mockAuthDeleteUser = vi.hoisted(() => vi.fn());

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      count: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    adminAuditLog: { create: vi.fn() },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));

vi.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { admin: { deleteUser: mockAuthDeleteUser } } },
}));

const ADMIN_CTX = { userId: 'admin-1' };

const ADMIN = makeUser({
  supabaseId: 'admin-1',
  email: 'admin@example.com',
  role: 'SUPERADMIN',
});

function makeInfo(query: string): GraphQLResolveInfo {
  const document = parse(query);
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  )!;

  return {
    fieldNodes: operation.selectionSet.selections,
    fragments: {},
  } as unknown as GraphQLResolveInfo;
}

function makeListRow(overrides: Parameters<typeof makeUser>[0] = {}) {
  return {
    ...makeUser(overrides),
    _count: {
      contracts: 1,
      netWorthSnapshots: 2,
      reportShares: 3,
      reports: 4,
      subscriptions: 5,
    },
  };
}

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
  mockAuthDeleteUser.mockResolvedValue({ error: null });
});

describe('adminResolvers', () => {
  describe('Query.adminUsers', () => {
    it('returns a page of users with the total count', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(ADMIN);
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        makeListRow({ supabaseId: 'user-2', email: 'ada@example.com' }),
      ]);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const result = await adminResolvers.Query.adminUsers(
        undefined,
        {},
        ADMIN_CTX,
        makeInfo('{ adminUsers { items { email } totalCount } }')
      );

      expect(result.totalCount).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ email: 'ada@example.com' });
    });

    it('skips the activity aggregates when counts are not selected', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(ADMIN);
      vi.mocked(prisma.user.findMany).mockResolvedValue([makeListRow()]);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      await adminResolvers.Query.adminUsers(
        undefined,
        {},
        ADMIN_CTX,
        makeInfo('{ adminUsers { items { email } } }')
      );

      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('refuses a user who is not a superadmin', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ supabaseId: 'user-2', role: 'USER' })
      );

      await expect(
        adminResolvers.Query.adminUsers(
          undefined,
          {},
          { userId: 'user-2' },
          makeInfo('{ adminUsers { items { email } } }')
        )
      ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
    });
  });

  describe('Query.adminInsights', () => {
    it('returns growth, activity and funnel figures', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(ADMIN);
      vi.mocked(prisma.user.count)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(9);
      vi.mocked(prisma.$queryRaw)
        .mockResolvedValueOnce([{ total: 9, completed: 2, withTransaction: 5 }])
        .mockResolvedValueOnce([
          { count: 3, week: new Date('2026-09-07T00:00:00Z') },
        ]);

      const result = await adminResolvers.Query.adminInsights(
        undefined,
        {},
        ADMIN_CTX
      );

      expect(result).toMatchObject({
        activeUsers24h: 1,
        activeUsers7d: 4,
        activeUsers30d: 6,
        registeredUsers: 9,
      });
      expect(result.onboardingFunnel.withTransaction).toBe(5);
      expect(result.signupsByWeek).toEqual([{ count: 3, week: '2026-09-07' }]);
    });

    it('refuses a user who is not a superadmin', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ supabaseId: 'user-2', role: 'USER' })
      );

      await expect(
        adminResolvers.Query.adminInsights(undefined, {}, { userId: 'user-2' })
      ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
    });
  });

  describe('Query.adminUser', () => {
    it('reports a user that does not exist', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(ADMIN)
        .mockResolvedValueOnce(null);

      await expect(
        adminResolvers.Query.adminUser(
          undefined,
          { supabaseId: 'ghost-1' },
          ADMIN_CTX
        )
      ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    });
  });

  describe('Mutation.adminDeleteUser', () => {
    it('deletes the user', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(ADMIN)
        .mockResolvedValueOnce(
          makeUser({ supabaseId: 'user-2', email: 'ada@example.com' })
        );

      const result = await adminResolvers.Mutation.adminDeleteUser(
        undefined,
        { input: { supabaseId: 'user-2', confirmEmail: 'Ada@Example.com' } },
        ADMIN_CTX
      );

      expect(result).toBe(true);
    });

    it('rejects a confirmation that is not an email address', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(ADMIN);

      await expect(
        adminResolvers.Mutation.adminDeleteUser(
          undefined,
          { input: { supabaseId: 'user-2', confirmEmail: 'nope' } },
          ADMIN_CTX
        )
      ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    });

    it('refuses a user who is not a superadmin', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        makeUser({ supabaseId: 'user-2', role: 'USER' })
      );

      await expect(
        adminResolvers.Mutation.adminDeleteUser(
          undefined,
          { input: { supabaseId: 'user-3', confirmEmail: 'ada@example.com' } },
          { userId: 'user-2' }
        )
      ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
    });
  });
});
