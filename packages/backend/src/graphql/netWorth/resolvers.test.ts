import { beforeEach, describe, expect, it, vi } from 'vitest';

import { netWorthResolvers } from './resolvers';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

const mockEntries = [
  {
    id: 'entry-1',
    type: 'ASSET',
    label: 'Savings Account',
    amount: 10000,
    category: 'Savings',
    snapshotId: 'snapshot-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: 'entry-2',
    type: 'LIABILITY',
    label: 'Car Loan',
    amount: 5000,
    category: 'Car Loan',
    snapshotId: 'snapshot-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
];

const mockSnapshot = {
  id: 'snapshot-1',
  title: 'January 2024',
  userId: USER_ID,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

const mockSnapshotWithEntries = {
  ...mockSnapshot,
  entries: mockEntries,
};

vi.mock('../../lib/prisma', () => ({
  default: {
    netWorthSnapshot: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    netWorthEntry: {
      findMany: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('netWorthResolvers', () => {
  describe('NetWorthSnapshot.entries', () => {
    it('returns pre-loaded entries from parent without querying DB', async () => {
      const result = await netWorthResolvers.NetWorthSnapshot.entries(
        mockSnapshotWithEntries
      );

      expect(prisma.netWorthEntry.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
    });

    it('fetches entries from DB when parent has none loaded', async () => {
      vi.mocked(prisma.netWorthEntry.findMany).mockResolvedValue(
        mockEntries as never
      );

      const result =
        await netWorthResolvers.NetWorthSnapshot.entries(mockSnapshot);

      expect(prisma.netWorthEntry.findMany).toHaveBeenCalledWith({
        where: { snapshotId: mockSnapshot.id },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockEntries);
    });
  });

  describe('NetWorthSnapshot.totalAssets', () => {
    it('sums ASSET entries from pre-loaded parent', async () => {
      const result = await netWorthResolvers.NetWorthSnapshot.totalAssets(
        mockSnapshotWithEntries
      );

      expect(prisma.netWorthEntry.findMany).not.toHaveBeenCalled();
      expect(result).toBe(10000);
    });
  });

  describe('NetWorthSnapshot.totalLiabilities', () => {
    it('sums LIABILITY entries from pre-loaded parent', async () => {
      const result = await netWorthResolvers.NetWorthSnapshot.totalLiabilities(
        mockSnapshotWithEntries
      );

      expect(prisma.netWorthEntry.findMany).not.toHaveBeenCalled();
      expect(result).toBe(5000);
    });
  });

  describe('NetWorthSnapshot.netWorth', () => {
    it('returns totalAssets minus totalLiabilities', async () => {
      const result = await netWorthResolvers.NetWorthSnapshot.netWorth(
        mockSnapshotWithEntries
      );

      expect(prisma.netWorthEntry.findMany).not.toHaveBeenCalled();
      expect(result).toBe(5000);
    });
  });

  describe('Query.netWorthSnapshots', () => {
    it('returns items and totalCount for page 1', async () => {
      vi.mocked(prisma.netWorthSnapshot.findMany).mockResolvedValue([
        mockSnapshotWithEntries as never,
      ]);
      vi.mocked(prisma.netWorthSnapshot.count).mockResolvedValue(1);

      const result = await netWorthResolvers.Query.netWorthSnapshots(
        undefined as unknown,
        { page: 1 },
        CTX
      );

      expect(prisma.netWorthSnapshot.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({
        items: [mockSnapshotWithEntries],
        totalCount: 1,
      });
    });

    it('skips 20 items for page 2', async () => {
      vi.mocked(prisma.netWorthSnapshot.findMany).mockResolvedValue([]);
      vi.mocked(prisma.netWorthSnapshot.count).mockResolvedValue(21);

      await netWorthResolvers.Query.netWorthSnapshots(
        undefined as unknown,
        { page: 2 },
        CTX
      );

      expect(prisma.netWorthSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
    });

    it('defaults to page 1 when page is not provided', async () => {
      vi.mocked(prisma.netWorthSnapshot.findMany).mockResolvedValue([]);
      vi.mocked(prisma.netWorthSnapshot.count).mockResolvedValue(0);

      await netWorthResolvers.Query.netWorthSnapshots(
        undefined as unknown,
        {},
        CTX
      );

      expect(prisma.netWorthSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 })
      );
    });
  });

  describe('Query.netWorthSnapshot', () => {
    it('returns a snapshot with its entries', async () => {
      vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(
        mockSnapshotWithEntries as never
      );

      const result = await netWorthResolvers.Query.netWorthSnapshot(
        undefined as unknown,
        { id: 'snapshot-1' },
        CTX
      );

      expect(prisma.netWorthSnapshot.findFirst).toHaveBeenCalledWith({
        where: { id: 'snapshot-1', userId: USER_ID },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
      expect(result).toEqual(mockSnapshotWithEntries);
    });

    it('returns null for a non-existent snapshot', async () => {
      vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(null);

      const result = await netWorthResolvers.Query.netWorthSnapshot(
        undefined as unknown,
        { id: 'non-existent' },
        CTX
      );

      expect(result).toBeNull();
    });
  });

  describe('Mutation.createNetWorthSnapshot', () => {
    it('creates a snapshot with entries', async () => {
      vi.mocked(prisma.netWorthSnapshot.create).mockResolvedValue(
        mockSnapshotWithEntries as never
      );

      const result = await netWorthResolvers.Mutation.createNetWorthSnapshot(
        undefined as unknown,
        {
          input: {
            title: 'January 2024',
            entries: [
              {
                type: 'ASSET',
                label: 'Savings Account',
                amount: 10000,
                category: 'Savings',
              },
            ],
          },
        },
        CTX
      );

      expect(prisma.netWorthSnapshot.create).toHaveBeenCalledWith({
        data: {
          title: 'January 2024',
          userId: USER_ID,
          entries: {
            create: [
              {
                type: 'ASSET',
                label: 'Savings Account',
                amount: 10000,
                category: 'Savings',
              },
            ],
          },
        },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
      expect(result).toEqual(mockSnapshotWithEntries);
    });
  });

  describe('Mutation.deleteNetWorthSnapshot', () => {
    it('deletes a snapshot and returns true', async () => {
      vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(
        mockSnapshot as never
      );
      vi.mocked(prisma.netWorthSnapshot.delete).mockResolvedValue(
        mockSnapshot as never
      );

      const result = await netWorthResolvers.Mutation.deleteNetWorthSnapshot(
        undefined as unknown,
        { id: 'snapshot-1' },
        CTX
      );

      expect(prisma.netWorthSnapshot.findFirst).toHaveBeenCalledWith({
        where: { id: 'snapshot-1', userId: USER_ID },
      });
      expect(prisma.netWorthSnapshot.delete).toHaveBeenCalledWith({
        where: { id: 'snapshot-1' },
      });
      expect(result).toBe(true);
    });

    it('throws NOT_FOUND error for snapshot that does not belong to user', async () => {
      vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(null);

      await expect(
        netWorthResolvers.Mutation.deleteNetWorthSnapshot(
          undefined as unknown,
          { id: 'other-snapshot' },
          CTX
        )
      ).rejects.toThrow('Net worth snapshot not found');
    });
  });
});
