import { beforeEach, describe, expect, it, vi } from 'vitest';

import { transactionResolvers } from './resolvers';

const mockTransaction = {
  id: 'tx-1',
  reportId: 'report-1',
  type: 'EXPENSE',
  amount: 50.25,
  description: 'Grocery shopping',
  category: 'Food',
  date: new Date('2024-01-15'),
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

vi.mock('../../lib/prisma', () => ({
  default: {
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
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

      const result = await transactionResolvers.Query.transactions();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('Query.transaction', () => {
    it('returns a single transaction by id', async () => {
      vi.mocked(prisma.transaction.findUnique).mockResolvedValue(
        mockTransaction
      );

      const result = await transactionResolvers.Query.transaction(
        undefined as unknown,
        { id: 'tx-1' }
      );

      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('returns null for non-existent transaction', async () => {
      vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null);

      const result = await transactionResolvers.Query.transaction(
        undefined as unknown,
        { id: 'non-existent' }
      );

      expect(result).toBeNull();
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

      vi.mocked(prisma.transaction.create).mockResolvedValue(mockTransaction);

      const result = await transactionResolvers.Mutation.createTransaction(
        undefined as unknown,
        { input }
      );

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          reportId: 'report-1',
          type: 'EXPENSE',
          amount: 50.25,
          description: 'Grocery shopping',
          category: 'Food',
          date: new Date('2024-01-15'),
        },
      });
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('Mutation.deleteTransaction', () => {
    it('deletes a transaction and returns true', async () => {
      vi.mocked(prisma.transaction.delete).mockResolvedValue(mockTransaction);

      const result = await transactionResolvers.Mutation.deleteTransaction(
        undefined as unknown,
        { id: 'tx-1' }
      );

      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(result).toBe(true);
    });
  });
});
