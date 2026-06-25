import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeTransaction } from '../../test/fixtures/reports';
import { reportResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

vi.mock('../../lib/prisma', () => ({
  default: {
    report: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('reportResolvers', () => {
  describe('Query.reports', () => {
    it('returns items and totalCount for page 1', async () => {
      const report = makeReport();
      vi.mocked(prisma.report.findMany).mockResolvedValue([report]);
      vi.mocked(prisma.report.count).mockResolvedValue(1);

      const result = await reportResolvers.Query.reports(
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
      expect(result).toEqual({ items: [report], totalCount: 1 });
    });

    it('skips 10 items for page 2', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([makeReport()]);
      vi.mocked(prisma.report.count).mockResolvedValue(11);

      await reportResolvers.Query.reports(
        undefined as unknown,
        { page: 2 },
        CTX
      );

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

      await reportResolvers.Query.reports(undefined as unknown, {}, CTX);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 })
      );
    });

    it('returns empty items with zero count', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      const result = await reportResolvers.Query.reports(
        undefined as unknown,
        { page: 1 },
        CTX
      );

      expect(result).toEqual({ items: [], totalCount: 0 });
    });

    it('filters by a case-insensitive title search', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([makeReport()]);
      vi.mocked(prisma.report.count).mockResolvedValue(1);

      await reportResolvers.Query.reports(
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

      const result = await reportResolvers.Query.reports(
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

      const result = await reportResolvers.Query.reports(
        undefined as unknown,
        { sortBy: 'NET_BALANCE', sortOrder: 'ASC' },
        CTX
      );

      expect(result.items.map((report) => report.id)).toEqual(['low', 'high']);
    });
  });

  describe('Report.transactions', () => {
    it('returns pre-loaded transactions from the parent without querying the DB', async () => {
      const transactions = [makeTransaction()];
      const parent = { ...makeReport(), transactions };

      const result = await reportResolvers.Report.transactions(parent);

      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(transactions);
    });

    it('fetches transactions from the DB when parent has none loaded', async () => {
      const transactions = [makeTransaction()];
      vi.mocked(prisma.transaction.findMany).mockResolvedValue(
        transactions as never
      );
      const parent = makeReport();

      const result = await reportResolvers.Report.transactions(parent);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { reportId: parent.id },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('Report.transactionCount', () => {
    it('returns the length of pre-loaded transactions without querying the DB', async () => {
      const parent = { ...makeReport(), transactions: [makeTransaction()] };

      const result = await reportResolvers.Report.transactionCount(parent);

      expect(prisma.transaction.count).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('queries the DB when parent has no pre-loaded transactions', async () => {
      vi.mocked(prisma.transaction.count).mockResolvedValue(3);
      const parent = makeReport();

      const result = await reportResolvers.Report.transactionCount(parent);

      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { reportId: parent.id },
      });
      expect(result).toBe(3);
    });
  });

  describe('Report.netBalance', () => {
    it('computes net balance from pre-loaded transactions without querying the DB', async () => {
      const parent = {
        ...makeReport(),
        transactions: [
          makeTransaction({ type: 'EXPENSE', amount: 50 }),
          makeTransaction({ id: 'transaction-2', type: 'INCOME', amount: 200 }),
        ],
      };

      const result = await reportResolvers.Report.netBalance(parent);

      expect(prisma.transaction.aggregate).not.toHaveBeenCalled();
      expect(result).toBe(150);
    });

    it('queries the DB when parent has no pre-loaded transactions', async () => {
      vi.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 500 } } as never)
        .mockResolvedValueOnce({ _sum: { amount: 300 } } as never);

      const result = await reportResolvers.Report.netBalance(makeReport());

      expect(prisma.transaction.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toBe(200);
    });

    it('handles null aggregate sums as zero', async () => {
      vi.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never);

      const result = await reportResolvers.Report.netBalance(makeReport());

      expect(result).toBe(0);
    });
  });

  describe('Query.report', () => {
    it('returns a report with its transactions', async () => {
      const reportWithTransactions = {
        ...makeReport(),
        transactions: [makeTransaction()],
      };
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        reportWithTransactions as never
      );

      const result = await reportResolvers.Query.report(
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

      const result = await reportResolvers.Query.report(
        undefined as unknown,
        { id: 'non-existent' },
        CTX
      );

      expect(result).toBeNull();
    });
  });

  describe('Mutation.createReport', () => {
    it('creates a report with the given title', async () => {
      const report = makeReport();
      vi.mocked(prisma.report.create).mockResolvedValue(report);

      const result = await reportResolvers.Mutation.createReport(
        undefined as unknown,
        { input: { title: 'January Budget' } },
        CTX
      );

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: { title: 'January Budget', userId: USER_ID },
      });
      expect(result).toEqual(report);
    });

    it('throws BAD_USER_INPUT when title exceeds 255 characters', async () => {
      await expect(
        reportResolvers.Mutation.createReport(
          undefined as unknown,
          { input: { title: 'x'.repeat(256) } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.create).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.updateReport', () => {
    it('updates a report title', async () => {
      const existing = makeReport();
      const updated = makeReport({
        title: 'February Budget',
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      });
      vi.mocked(prisma.report.findFirst).mockResolvedValue(existing);
      vi.mocked(prisma.report.update).mockResolvedValue(updated);

      const result = await reportResolvers.Mutation.updateReport(
        undefined as unknown,
        { input: { id: 'report-1', title: 'February Budget' } },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1', userId: USER_ID },
      });
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { title: 'February Budget' },
      });
      expect(result).toEqual(updated);
    });

    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportResolvers.Mutation.updateReport(
          undefined as unknown,
          { input: { id: 'report-1', title: 'February Budget' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when the report is locked', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        makeReport({ isLocked: true })
      );

      await expect(
        reportResolvers.Mutation.updateReport(
          undefined as unknown,
          { input: { id: 'report-1', title: 'February Budget' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.deleteReport', () => {
    it('deletes a report and returns true', async () => {
      const report = makeReport();
      vi.mocked(prisma.report.findFirst).mockResolvedValue(report);
      vi.mocked(prisma.report.delete).mockResolvedValue(report);

      const result = await reportResolvers.Mutation.deleteReport(
        undefined as unknown,
        { id: 'report-1' },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1', userId: USER_ID },
      });
      expect(prisma.report.delete).toHaveBeenCalledWith({
        where: { id: 'report-1' },
      });
      expect(result).toBe(true);
    });

    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportResolvers.Mutation.deleteReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.delete).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when the report is locked', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        makeReport({ isLocked: true })
      );

      await expect(
        reportResolvers.Mutation.deleteReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.delete).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.lockReport', () => {
    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportResolvers.Mutation.lockReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.unlockReport', () => {
    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportResolvers.Mutation.unlockReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });
});
