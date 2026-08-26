import { GraphQLError } from 'graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  makeReport,
  makeReportShare,
  makeTransaction,
} from '../../test/fixtures/reports';
import { reportAccessWhere } from '../reports/lib/reportAccess';
import { transactionResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

const mockTransaction = makeTransaction({
  id: 'tx-1',
  amount: 50.25,
  description: 'Grocery shopping',
});

const mockReport = makeReport();

vi.mock('../../lib/prisma', () => ({
  default: {
    report: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
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

describe('transactionResolvers', () => {
  describe('Query.transactions', () => {
    it('returns all transactions ordered by date descending', async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([
        mockTransaction,
      ]);

      const result = await transactionResolvers.Query.transactions(
        undefined as unknown,
        undefined as unknown,
        CTX
      );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { report: reportAccessWhere(USER_ID) },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('Query.transaction', () => {
    it('returns a single transaction by id', async () => {
      vi.mocked(prisma.transaction.findFirst).mockResolvedValue(
        mockTransaction
      );

      const result = await transactionResolvers.Query.transaction(
        undefined as unknown,
        { id: 'tx-1' },
        CTX
      );

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', report: reportAccessWhere(USER_ID) },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('returns null for non-existent transaction', async () => {
      vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);

      const result = await transactionResolvers.Query.transaction(
        undefined as unknown,
        { id: 'non-existent' },
        CTX
      );

      expect(result).toBeNull();
    });
  });

  describe('Query.expenseCategoryTotalsByMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-26T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('aggregates accessible expense transactions by category and month', async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([
        { amount: 40, category: 'Groceries', date: new Date('2026-08-02') },
        { amount: 12, category: 'Groceries', date: new Date('2026-08-19') },
        { amount: 800, category: 'Rent', date: new Date('2026-07-01') },
      ] as never);

      const result =
        await transactionResolvers.Query.expenseCategoryTotalsByMonth(
          undefined as unknown,
          { months: 3 },
          CTX
        );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          type: 'EXPENSE',
          date: { gte: new Date('2026-06-01T00:00:00.000Z') },
          report: reportAccessWhere(USER_ID),
        },
        select: { amount: true, category: true, date: true },
        take: 10000,
      });
      expect(result).toEqual([
        { category: 'Groceries', month: '2026-08', total: 52 },
        { category: 'Rent', month: '2026-07', total: 800 },
      ]);
    });

    it('clamps a months argument beyond the supported range', async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

      await transactionResolvers.Query.expenseCategoryTotalsByMonth(
        undefined as unknown,
        { months: 999 },
        CTX
      );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: { gte: new Date('2024-09-01T00:00:00.000Z') },
          }),
        })
      );
    });
  });

  describe('Mutation.createTransaction', () => {
    it('creates a transaction with correct data', async () => {
      const input = {
        reportId: 'report-1',
        type: 'EXPENSE' as const,
        amount: 50.25,
        description: 'Grocery shopping',
        category: 'Food',
        date: '2024-01-15',
      };

      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...mockReport,
        shares: [],
      } as never);
      vi.mocked(prisma.report.update).mockResolvedValue(mockReport);
      vi.mocked(prisma.transaction.create).mockResolvedValue(mockTransaction);

      const result = await transactionResolvers.Mutation.createTransaction(
        undefined as unknown,
        { input },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        include: { shares: true },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          reportId: 'report-1',
          type: 'EXPENSE',
          amount: 50.25,
          description: 'Grocery shopping',
          category: 'Food',
          date: new Date('2024-01-15'),
          createdById: USER_ID,
        },
      });
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { updatedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('allows a shared editor to create a transaction with attribution', async () => {
      const input = {
        reportId: 'report-1',
        type: 'EXPENSE' as const,
        amount: 50.25,
        description: 'Grocery shopping',
        category: 'Food',
        date: '2024-01-15',
      };

      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport({ userId: 'other-owner' }),
        shares: [makeReportShare({ userId: USER_ID, role: 'EDITOR' })],
      } as never);
      vi.mocked(prisma.report.update).mockResolvedValue(mockReport);
      vi.mocked(prisma.transaction.create).mockResolvedValue(mockTransaction);

      await transactionResolvers.Mutation.createTransaction(
        undefined as unknown,
        { input },
        CTX
      );

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ createdById: USER_ID }),
      });
    });

    it('throws FORBIDDEN for a shared viewer', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport({ userId: 'other-owner' }),
        shares: [makeReportShare({ userId: USER_ID, role: 'VIEWER' })],
      } as never);

      await expect(
        transactionResolvers.Mutation.createTransaction(
          undefined as unknown,
          { input: { reportId: 'report-1' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND for a user with no access to the report', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport({ userId: 'other-owner' }),
        shares: [],
      } as never);

      await expect(
        transactionResolvers.Mutation.createTransaction(
          undefined as unknown,
          { input: { reportId: 'report-1' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.updateTransaction', () => {
    it('updates a transaction with correct data', async () => {
      const input = {
        id: 'tx-1',
        type: 'INCOME' as const,
        amount: 100.0,
        description: 'Updated description',
        category: 'Salary',
        date: '2024-02-01',
      };

      const updatedTransaction = {
        ...mockTransaction,
        ...input,
        date: new Date('2024-02-01'),
      };

      vi.mocked(prisma.transaction.findFirst).mockResolvedValue(
        mockTransaction
      );
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...mockReport,
        shares: [],
      } as never);
      vi.mocked(prisma.transaction.update).mockResolvedValue(
        updatedTransaction
      );
      vi.mocked(prisma.report.update).mockResolvedValue(mockReport);

      const result = await transactionResolvers.Mutation.updateTransaction(
        undefined as unknown,
        { input },
        CTX
      );

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', report: reportAccessWhere(USER_ID) },
      });
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: {
          type: 'INCOME',
          amount: 100.0,
          description: 'Updated description',
          category: 'Salary',
          date: new Date('2024-02-01'),
        },
      });
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { updatedAt: expect.any(Date) },
      });
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('Mutation.deleteTransaction', () => {
    it('deletes a transaction and returns true', async () => {
      vi.mocked(prisma.transaction.findFirst).mockResolvedValue(
        mockTransaction
      );
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...mockReport,
        shares: [],
      } as never);
      vi.mocked(prisma.transaction.delete).mockResolvedValue(mockTransaction);
      vi.mocked(prisma.report.update).mockResolvedValue(mockReport);

      const result = await transactionResolvers.Mutation.deleteTransaction(
        undefined as unknown,
        { id: 'tx-1' },
        CTX
      );

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', report: reportAccessWhere(USER_ID) },
      });
      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { updatedAt: expect.any(Date) },
      });
      expect(result).toBe(true);
    });
  });
});
