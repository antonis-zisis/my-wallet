import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport } from '../../../test/fixtures/reports';
import { attachReportTotals } from './attachReportTotals';

vi.mock('../../../lib/prisma', () => ({
  default: {
    transaction: {
      groupBy: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('attachReportTotals', () => {
  it('returns an empty array for no reports without querying the DB', async () => {
    const result = await attachReportTotals([]);

    expect(result).toEqual([]);
    expect(prisma.transaction.groupBy).not.toHaveBeenCalled();
  });

  it('attaches the net balance and transaction count to each report', async () => {
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      {
        reportId: 'report-1',
        type: 'INCOME',
        _sum: { amount: 3000 },
        _count: { _all: 2 },
      },
      {
        reportId: 'report-1',
        type: 'EXPENSE',
        _sum: { amount: 1200 },
        _count: { _all: 5 },
      },
      {
        reportId: 'report-2',
        type: 'EXPENSE',
        _sum: { amount: 40 },
        _count: { _all: 1 },
      },
    ] as never);

    const result = await attachReportTotals([
      makeReport({ id: 'report-1' }),
      makeReport({ id: 'report-2' }),
    ]);

    expect(result[0]).toMatchObject({ netBalance: 1800, transactionCount: 7 });
    expect(result[1]).toMatchObject({ netBalance: -40, transactionCount: 1 });
  });

  it('reads every report in a single query', async () => {
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([] as never);

    await attachReportTotals([
      makeReport({ id: 'report-1' }),
      makeReport({ id: 'report-2' }),
      makeReport({ id: 'report-3' }),
    ]);

    expect(prisma.transaction.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reportId: { in: ['report-1', 'report-2', 'report-3'] } },
      })
    );
  });

  it('reports zero for a report with no transactions', async () => {
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([] as never);

    const result = await attachReportTotals([makeReport({ id: 'report-1' })]);

    expect(result[0]).toMatchObject({ netBalance: 0, transactionCount: 0 });
  });
});
