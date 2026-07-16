import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeTransaction } from '../../test/fixtures/reports';
import { reportFields } from './fields';

vi.mock('../../lib/prisma', () => ({
  default: {
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('reportFields', () => {
  describe('transactions', () => {
    it('returns pre-loaded transactions from the parent without querying the DB', async () => {
      const transactions = [makeTransaction()];
      const parent = { ...makeReport(), transactions };

      const result = await reportFields.transactions(parent);

      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(transactions);
    });

    it('fetches transactions from the DB when parent has none loaded', async () => {
      const transactions = [makeTransaction()];
      vi.mocked(prisma.transaction.findMany).mockResolvedValue(
        transactions as never
      );
      const parent = makeReport();

      const result = await reportFields.transactions(parent);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { reportId: parent.id },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('transactionCount', () => {
    it('returns the length of pre-loaded transactions without querying the DB', async () => {
      const parent = { ...makeReport(), transactions: [makeTransaction()] };

      const result = await reportFields.transactionCount(parent);

      expect(prisma.transaction.count).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('queries the DB when parent has no pre-loaded transactions', async () => {
      vi.mocked(prisma.transaction.count).mockResolvedValue(3);
      const parent = makeReport();

      const result = await reportFields.transactionCount(parent);

      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { reportId: parent.id },
      });
      expect(result).toBe(3);
    });
  });

  describe('netBalance', () => {
    it('computes net balance from pre-loaded transactions without querying the DB', async () => {
      const parent = {
        ...makeReport(),
        transactions: [
          makeTransaction({ type: 'EXPENSE', amount: 50 }),
          makeTransaction({ id: 'transaction-2', type: 'INCOME', amount: 200 }),
        ],
      };

      const result = await reportFields.netBalance(parent);

      expect(prisma.transaction.aggregate).not.toHaveBeenCalled();
      expect(result).toBe(150);
    });

    it('queries the DB when parent has no pre-loaded transactions', async () => {
      vi.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 500 } } as never)
        .mockResolvedValueOnce({ _sum: { amount: 300 } } as never);

      const result = await reportFields.netBalance(makeReport());

      expect(prisma.transaction.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toBe(200);
    });

    it('handles null aggregate sums as zero', async () => {
      vi.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never);

      const result = await reportFields.netBalance(makeReport());

      expect(result).toBe(0);
    });
  });
});
