import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reportResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

const mockReport = {
  id: 'report-1',
  title: 'January Budget',
  userId: USER_ID,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

const mockReportWithTransactions = {
  ...mockReport,
  transactions: [
    {
      id: 'tx-1',
      reportId: 'report-1',
      type: 'EXPENSE',
      amount: 50,
      description: 'Groceries',
      category: 'Food',
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    },
  ],
};

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
      vi.mocked(prisma.report.findMany).mockResolvedValue([mockReport]);
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
        take: 20,
      });
      expect(prisma.report.count).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
      expect(result).toEqual({ items: [mockReport], totalCount: 1 });
    });

    it('skips 20 items for page 2', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([mockReport]);
      vi.mocked(prisma.report.count).mockResolvedValue(21);

      await reportResolvers.Query.reports(
        undefined as unknown,
        { page: 2 },
        CTX
      );

      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        skip: 20,
        take: 20,
      });
    });

    it('defaults to page 1 when page is not provided', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      await reportResolvers.Query.reports(undefined as unknown, {}, CTX);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 })
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
  });

  describe('Report.transactions', () => {
    it('returns pre-loaded transactions from the parent without querying the DB', async () => {
      const result = await reportResolvers.Report.transactions(
        mockReportWithTransactions
      );

      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockReportWithTransactions.transactions);
    });

    it('fetches transactions from the DB when parent has none loaded', async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue(
        mockReportWithTransactions.transactions as never
      );

      const result = await reportResolvers.Report.transactions(mockReport);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { reportId: mockReport.id },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(mockReportWithTransactions.transactions);
    });
  });

  describe('Query.report', () => {
    it('returns a report with its transactions', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        mockReportWithTransactions as never
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
      expect(result).toEqual(mockReportWithTransactions);
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
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport);

      const result = await reportResolvers.Mutation.createReport(
        undefined as unknown,
        { input: { title: 'January Budget' } },
        CTX
      );

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: { title: 'January Budget', userId: USER_ID },
      });
      expect(result).toEqual(mockReport);
    });
  });

  describe('Mutation.updateReport', () => {
    it('updates a report title', async () => {
      const updatedReport = {
        ...mockReport,
        title: 'February Budget',
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      };
      vi.mocked(prisma.report.findFirst).mockResolvedValue(mockReport);
      vi.mocked(prisma.report.update).mockResolvedValue(updatedReport);

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
      expect(result).toEqual(updatedReport);
    });
  });

  describe('Mutation.deleteReport', () => {
    it('deletes a report and returns true', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(mockReport);
      vi.mocked(prisma.report.delete).mockResolvedValue(mockReport);

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
  });
});
