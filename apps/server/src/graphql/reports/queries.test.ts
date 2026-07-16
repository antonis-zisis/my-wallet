import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeTransaction } from '../../test/fixtures/reports';
import { makeUser } from '../../test/fixtures/users';
import { reportQueries } from './queries';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

vi.mock('../../lib/prisma', () => ({
  default: {
    report: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    reportShare: {
      findMany: vi.fn(),
    },
    transaction: {
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
  vi.mocked(prisma.reportShare.findMany).mockResolvedValue([]);
  vi.mocked(prisma.user.findMany).mockResolvedValue([]);
});

describe('reportQueries', () => {
  describe('reports', () => {
    it('returns items with members and totalCount for page 1', async () => {
      const report = makeReport();
      const owner = makeUser();
      vi.mocked(prisma.report.findMany).mockResolvedValue([report]);
      vi.mocked(prisma.report.count).mockResolvedValue(1);
      vi.mocked(prisma.user.findMany).mockResolvedValue([owner]);

      const result = await reportQueries.reports(
        undefined as unknown,
        { page: 1 },
        CTX
      );

      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.report.count).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
      expect(result).toEqual({
        items: [
          {
            ...report,
            members: [
              {
                id: report.userId,
                userId: report.userId,
                email: owner.email,
                fullName: owner.fullName,
                role: 'OWNER',
              },
            ],
          },
        ],
        totalCount: 1,
      });
    });

    it('skips 10 items for page 2', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([makeReport()]);
      vi.mocked(prisma.report.count).mockResolvedValue(11);

      await reportQueries.reports(undefined as unknown, { page: 2 }, CTX);

      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
    });

    it('defaults to page 1 when page is not provided', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      await reportQueries.reports(undefined as unknown, {}, CTX);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 })
      );
    });

    it('returns empty items with zero count', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      const result = await reportQueries.reports(
        undefined as unknown,
        { page: 1 },
        CTX
      );

      expect(result).toEqual({ items: [], totalCount: 0 });
    });

    it('filters by a case-insensitive title search', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([makeReport()]);
      vi.mocked(prisma.report.count).mockResolvedValue(1);

      await reportQueries.reports(
        undefined as unknown,
        { search: '  jan ' },
        CTX
      );

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: USER_ID,
            title: { contains: 'jan', mode: 'insensitive' },
          },
        })
      );
    });

    it('sorts by net balance descending and paginates in memory', async () => {
      const low = makeReport({ id: 'low' });
      const high = makeReport({ id: 'high' });
      vi.mocked(prisma.report.findMany).mockResolvedValue([low, high]);
      vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
        { reportId: 'low', type: 'INCOME', _sum: { amount: 100 } },
        { reportId: 'high', type: 'INCOME', _sum: { amount: 900 } },
      ] as never);

      const result = await reportQueries.reports(
        undefined as unknown,
        { sortBy: 'NET_BALANCE', sortOrder: 'DESC' },
        CTX
      );

      expect(prisma.report.count).not.toHaveBeenCalled();
      expect(result.items.map((report) => report.id)).toEqual(['high', 'low']);
      expect(result.totalCount).toBe(2);
    });

    it('sorts by net balance ascending', async () => {
      const low = makeReport({ id: 'low' });
      const high = makeReport({ id: 'high' });
      vi.mocked(prisma.report.findMany).mockResolvedValue([high, low]);
      vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
        { reportId: 'low', type: 'EXPENSE', _sum: { amount: 100 } },
        { reportId: 'high', type: 'INCOME', _sum: { amount: 900 } },
      ] as never);

      const result = await reportQueries.reports(
        undefined as unknown,
        { sortBy: 'NET_BALANCE', sortOrder: 'ASC' },
        CTX
      );

      expect(result.items.map((report) => report.id)).toEqual(['low', 'high']);
    });
  });

  describe('report', () => {
    it('returns a report with its transactions', async () => {
      const reportWithTransactions = {
        ...makeReport(),
        transactions: [makeTransaction()],
      };
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        reportWithTransactions as never
      );

      const result = await reportQueries.report(
        undefined as unknown,
        { id: 'report-1' },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1', userId: USER_ID },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
      expect(result).toEqual(reportWithTransactions);
    });

    it('returns null for non-existent report', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      const result = await reportQueries.report(
        undefined as unknown,
        { id: 'non-existent' },
        CTX
      );

      expect(result).toBeNull();
    });
  });
});
