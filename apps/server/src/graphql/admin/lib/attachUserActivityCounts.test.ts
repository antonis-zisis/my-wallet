import { beforeEach, describe, expect, it, vi } from 'vitest';

import { attachUserActivityCounts } from './attachUserActivityCounts';

vi.mock('../../../lib/prisma', () => ({
  default: { $queryRaw: vi.fn() },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('attachUserActivityCounts', () => {
  it('returns an empty list without querying', async () => {
    const result = await attachUserActivityCounts([]);

    expect(result).toEqual([]);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('attaches each user their own transaction and shared-report counts', async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([{ userId: 'user-1', count: 42 }])
      .mockResolvedValueOnce([{ userId: 'user-1', count: 3 }]);

    const result = await attachUserActivityCounts([
      { supabaseId: 'user-1' },
      { supabaseId: 'user-2' },
    ]);

    expect(result).toEqual([
      { supabaseId: 'user-1', transactionCount: 42, sharedOwnedReportCount: 3 },
      { supabaseId: 'user-2', transactionCount: 0, sharedOwnedReportCount: 0 },
    ]);
  });
});
