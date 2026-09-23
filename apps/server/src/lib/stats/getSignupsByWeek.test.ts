import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSignupsByWeek } from './getSignupsByWeek';

vi.mock('../prisma', () => ({
  default: { $queryRaw: vi.fn() },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

describe('getSignupsByWeek', () => {
  it('returns one dated bucket per week', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { count: 3, week: new Date('2026-09-07T00:00:00Z') },
      { count: 1, week: new Date('2026-09-14T00:00:00Z') },
    ]);

    const result = await getSignupsByWeek();

    expect(result).toEqual([
      { count: 3, week: '2026-09-07' },
      { count: 1, week: '2026-09-14' },
    ]);
  });

  it('returns nothing when no one has signed up', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    expect(await getSignupsByWeek()).toEqual([]);
  });
});
