import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeContract } from '../../test/fixtures/contracts';
import { contractResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

const mockContract = makeContract({ id: 'contract-1', userId: USER_ID });

vi.mock('../../lib/prisma', () => ({
  default: {
    contract: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
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

describe('contractResolvers', () => {
  describe('Query.contracts', () => {
    it('returns items and totalCount sorted by end date', async () => {
      vi.mocked(prisma.contract.findMany).mockResolvedValue([
        mockContract as never,
      ]);
      vi.mocked(prisma.contract.count).mockResolvedValue(1);

      const result = await contractResolvers.Query.contracts(
        undefined,
        { page: 1 },
        CTX
      );

      expect(prisma.contract.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { endDate: { sort: 'asc', nulls: 'last' } },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ items: [mockContract], totalCount: 1 });
    });

    it('filters to expired contracts when expired is true', async () => {
      vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
      vi.mocked(prisma.contract.count).mockResolvedValue(0);

      await contractResolvers.Query.contracts(
        undefined,
        { expired: true },
        CTX
      );

      expect(prisma.contract.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: USER_ID,
            endDate: expect.objectContaining({ lt: expect.any(Date) }),
          }),
        })
      );
    });
  });

  describe('Contract.isExpired', () => {
    it('is true for a contract whose end date has passed', () => {
      const result = contractResolvers.Contract.isExpired({
        endDate: new Date('2000-01-01T00:00:00Z'),
      });

      expect(result).toBe(true);
    });

    it('is false for an open-ended contract', () => {
      const result = contractResolvers.Contract.isExpired({ endDate: null });

      expect(result).toBe(false);
    });
  });

  describe('Mutation.createContract', () => {
    it('creates a contract owned by the context user', async () => {
      vi.mocked(prisma.contract.create).mockResolvedValue(
        mockContract as never
      );

      await contractResolvers.Mutation.createContract(
        undefined,
        { input: { category: 'Internet', provider: 'Cosmote' } },
        CTX
      );

      expect(prisma.contract.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: 'Internet',
          provider: 'Cosmote',
          userId: USER_ID,
        }),
      });
    });

    it('rejects an end date before the start date', async () => {
      await expect(
        contractResolvers.Mutation.createContract(
          undefined,
          {
            input: {
              category: 'Internet',
              provider: 'Cosmote',
              startDate: '2026-06-01',
              endDate: '2025-01-01',
            },
          },
          CTX
        )
      ).rejects.toThrow('End date must be on or after start date');

      expect(prisma.contract.create).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.updateContract', () => {
    it('throws NOT_FOUND when the contract belongs to another user', async () => {
      vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);

      await expect(
        contractResolvers.Mutation.updateContract(
          undefined,
          {
            input: {
              id: 'contract-1',
              category: 'Internet',
              provider: 'Cosmote',
            },
          },
          CTX
        )
      ).rejects.toThrow('Contract not found');

      expect(prisma.contract.update).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.deleteContract', () => {
    it('deletes an owned contract and returns true', async () => {
      vi.mocked(prisma.contract.findFirst).mockResolvedValue(
        mockContract as never
      );
      vi.mocked(prisma.contract.delete).mockResolvedValue(
        mockContract as never
      );

      const result = await contractResolvers.Mutation.deleteContract(
        undefined,
        { id: 'contract-1' },
        CTX
      );

      expect(result).toBe(true);
      expect(prisma.contract.delete).toHaveBeenCalledWith({
        where: { id: 'contract-1' },
      });
    });

    it('throws NOT_FOUND when the contract does not exist', async () => {
      vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);

      await expect(
        contractResolvers.Mutation.deleteContract(
          undefined,
          { id: 'missing' },
          CTX
        )
      ).rejects.toThrow('Contract not found');

      expect(prisma.contract.delete).not.toHaveBeenCalled();
    });
  });
});
