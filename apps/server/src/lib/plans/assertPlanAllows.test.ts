import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures/users';
import { assertPlanAllows } from './assertPlanAllows';

vi.mock('../prisma', () => ({
  default: { user: { findUnique: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

describe('assertPlanAllows', () => {
  it('resolves when the plan includes the capability', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({ plan: 'PRO' })
    );

    await expect(
      assertPlanAllows({ userId: 'user-1', capability: 'canShareReports' })
    ).resolves.toBeUndefined();
  });

  it('throws a plan-limit error when the plan excludes the capability', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({ plan: 'FREE' })
    );

    const error = await assertPlanAllows({
      userId: 'user-1',
      capability: 'canShareReports',
    }).catch((thrown: GraphQLError) => thrown);

    expect((error as GraphQLError).message).toBe(
      'Sharing reports is a Pro feature. Upgrade to share this report.'
    );
    expect((error as GraphQLError).extensions).toEqual({
      code: 'FORBIDDEN',
      reason: 'PLAN_LIMIT',
      capability: 'canShareReports',
    });
  });
});
