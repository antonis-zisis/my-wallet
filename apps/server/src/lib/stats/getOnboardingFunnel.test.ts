import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOnboardingFunnel } from './getOnboardingFunnel';

vi.mock('../prisma', () => ({
  default: { $queryRaw: vi.fn() },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

describe('getOnboardingFunnel', () => {
  it('returns the per-step totals', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        completed: 1,
        total: 10,
        withContract: 2,
        withFullName: 8,
        withNetWorthSnapshot: 3,
        withSubscription: 5,
        withTransaction: 7,
      },
    ]);

    const result = await getOnboardingFunnel();

    expect(result).toEqual({
      completed: 1,
      total: 10,
      withContract: 2,
      withFullName: 8,
      withNetWorthSnapshot: 3,
      withSubscription: 5,
      withTransaction: 7,
    });
  });

  it('reports zeroes when there are no users at all', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    const result = await getOnboardingFunnel();

    expect(result.total).toBe(0);
    expect(result.withTransaction).toBe(0);
  });
});
