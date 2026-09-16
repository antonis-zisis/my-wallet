import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  makeNetWorthEntry,
  makeNetWorthSnapshot,
} from '../../../test/fixtures/netWorth';
import { attachPreviousSnapshots } from './attachPreviousSnapshots';

vi.mock('../../../lib/prisma', () => ({
  default: {
    netWorthSnapshot: {
      findMany: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

const january = makeNetWorthSnapshot({
  id: 'january',
  snapshotDate: new Date('2024-01-01T00:00:00Z'),
});
const february = makeNetWorthSnapshot({
  id: 'february',
  snapshotDate: new Date('2024-02-01T00:00:00Z'),
});

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('attachPreviousSnapshots', () => {
  it('returns an empty array for no snapshots without querying the DB', async () => {
    const result = await attachPreviousSnapshots([]);

    expect(result).toEqual([]);
    expect(prisma.netWorthSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('attaches the preceding snapshot with its entries', async () => {
    const entries = [makeNetWorthEntry({ snapshotId: 'january' })];
    vi.mocked(prisma.netWorthSnapshot.findMany)
      .mockResolvedValueOnce([january, february])
      .mockResolvedValueOnce([{ ...january, entries }] as never);

    const result = await attachPreviousSnapshots([february]);

    expect(result[0].previousSnapshot).toEqual({ ...january, entries });
  });

  it('attaches null for the earliest snapshot', async () => {
    vi.mocked(prisma.netWorthSnapshot.findMany).mockResolvedValueOnce([
      january,
      february,
    ]);

    const result = await attachPreviousSnapshots([january]);

    expect(result[0].previousSnapshot).toBeNull();
    expect(prisma.netWorthSnapshot.findMany).toHaveBeenCalledTimes(1);
  });

  it('reads a whole page in two queries regardless of its size', async () => {
    vi.mocked(prisma.netWorthSnapshot.findMany)
      .mockResolvedValueOnce([january, february])
      .mockResolvedValueOnce([january] as never);

    await attachPreviousSnapshots([february, january]);

    expect(prisma.netWorthSnapshot.findMany).toHaveBeenCalledTimes(2);
  });
});
