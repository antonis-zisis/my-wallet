import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reportResolvers } from './resolvers';

const mockReport = {
  id: 'report-1',
  title: 'January Budget',
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
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
    it('returns items and totalCount', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([mockReport]);
      vi.mocked(prisma.report.count).mockResolvedValue(1);

      const result = await reportResolvers.Query.reports();

      expect(prisma.report.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.report.count).toHaveBeenCalled();
      expect(result).toEqual({ items: [mockReport], totalCount: 1 });
    });

    it('returns empty items with zero count', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      const result = await reportResolvers.Query.reports();

      expect(result).toEqual({ items: [], totalCount: 0 });
    });
  });

  describe('Query.report', () => {
    it('returns a report with its transactions', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(
        mockReportWithTransactions as never
      );

      const result = await reportResolvers.Query.report(undefined as unknown, {
        id: 'report-1',
      });

      expect(prisma.report.findUnique).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
      expect(result).toEqual(mockReportWithTransactions);
    });

    it('returns null for non-existent report', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(null);

      const result = await reportResolvers.Query.report(undefined as unknown, {
        id: 'non-existent',
      });

      expect(result).toBeNull();
    });
  });

  describe('Mutation.createReport', () => {
    it('creates a report with the given title', async () => {
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport);

      const result = await reportResolvers.Mutation.createReport(
        undefined as unknown,
        { input: { title: 'January Budget' } }
      );

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: { title: 'January Budget' },
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
      vi.mocked(prisma.report.update).mockResolvedValue(updatedReport);

      const result = await reportResolvers.Mutation.updateReport(
        undefined as unknown,
        { input: { id: 'report-1', title: 'February Budget' } }
      );

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { title: 'February Budget' },
      });
      expect(result).toEqual(updatedReport);
    });
  });

  describe('Mutation.deleteReport', () => {
    it('deletes a report and returns true', async () => {
      vi.mocked(prisma.report.delete).mockResolvedValue(mockReport);

      const result = await reportResolvers.Mutation.deleteReport(
        undefined as unknown,
        { id: 'report-1' }
      );

      expect(prisma.report.delete).toHaveBeenCalledWith({
        where: { id: 'report-1' },
      });
      expect(result).toBe(true);
    });
  });
});
