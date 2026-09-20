import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures/users';
import { assertWithinPlanLimit } from './assertWithinPlanLimit';

vi.mock('../prisma', () => ({
  default: { user: { findUnique: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

function onFreePlan() {
  vi.mocked(prisma.user.findUnique).mockResolvedValue(
    makeUser({ plan: 'FREE' })
  );
}

describe('assertWithinPlanLimit', () => {
  it('resolves when the user is below the limit', async () => {
    onFreePlan();

    await expect(
      assertWithinPlanLimit({
        userId: 'user-1',
        limit: 'maxReports',
        countCurrent: async () => 2,
      })
    ).resolves.toBeUndefined();
  });

  it('throws once the count has reached the limit', async () => {
    onFreePlan();

    const assertion = assertWithinPlanLimit({
      userId: 'user-1',
      limit: 'maxReports',
      countCurrent: async () => 3,
    });

    await expect(assertion).rejects.toThrow(
      'The Free plan is limited to 3 reports. Upgrade to Pro for unlimited reports.'
    );
  });

  it('marks the error as a plan limit so the client can offer an upgrade', async () => {
    onFreePlan();

    const error = await assertWithinPlanLimit({
      userId: 'user-1',
      limit: 'maxReports',
      countCurrent: async () => 3,
    }).catch((thrown: GraphQLError) => thrown);

    expect(error).toBeInstanceOf(GraphQLError);
    expect((error as GraphQLError).extensions).toEqual({
      code: 'FORBIDDEN',
      reason: 'PLAN_LIMIT',
      limit: 'maxReports',
      maximum: 3,
    });
  });

  it('uses the singular noun for a limit of one', async () => {
    onFreePlan();

    const assertion = assertWithinPlanLimit({
      userId: 'user-1',
      limit: 'maxNetWorthSnapshots',
      countCurrent: async () => 1,
    });

    await expect(assertion).rejects.toThrow(
      'The Free plan is limited to 1 net worth snapshot.'
    );
  });

  it('never counts when the plan has no limit', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({ plan: 'PRO' })
    );
    const countCurrent = vi.fn();

    await assertWithinPlanLimit({
      userId: 'user-1',
      limit: 'maxReports',
      countCurrent,
    });

    expect(countCurrent).not.toHaveBeenCalled();
  });
});
