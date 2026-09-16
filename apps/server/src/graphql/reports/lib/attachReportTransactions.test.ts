import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeTransaction } from '../../../test/fixtures/reports';
import { attachReportTransactions } from './attachReportTransactions';

vi.mock('../../../lib/prisma', () => ({
  default: {
    transaction: {
      findMany: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('attachReportTransactions', () => {
  it('returns an empty array for no reports without querying the DB', async () => {
    const result = await attachReportTransactions([]);

    expect(result).toEqual([]);
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it('groups transactions under the report they belong to', async () => {
    const own = makeTransaction({ id: 'transaction-1', reportId: 'report-1' });
    const other = makeTransaction({
      id: 'transaction-2',
      reportId: 'report-2',
    });
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([own, other]);

    const result = await attachReportTransactions([
      makeReport({ id: 'report-1' }),
      makeReport({ id: 'report-2' }),
    ]);

    expect(result[0].transactions).toEqual([own]);
    expect(result[1].transactions).toEqual([other]);
  });

  it('reads every report in a single query', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    await attachReportTransactions([
      makeReport({ id: 'report-1' }),
      makeReport({ id: 'report-2' }),
    ]);

    expect(prisma.transaction.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reportId: { in: ['report-1', 'report-2'] } },
      })
    );
  });

  it('gives a report with no transactions an empty list', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const result = await attachReportTransactions([makeReport()]);

    expect(result[0].transactions).toEqual([]);
  });
});
