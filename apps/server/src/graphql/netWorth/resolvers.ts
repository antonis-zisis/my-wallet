import { GraphQLError } from 'graphql';

import { NetWorthEntry } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { clampPage, parseInput } from '../../lib/validate';
import { NetWorthSnapshotInput } from './inputSchemas';
import { sortSnapshotsByChange } from './lib/sortSnapshotsByChange';

type NetWorthSnapshotsArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'SNAPSHOT_DATE' | 'CHANGE';
  sortOrder?: 'ASC' | 'DESC';
};

type SnapshotParent = {
  id: string;
  userId: string;
  snapshotDate: Date;
  createdAt: Date;
  entries?: Array<NetWorthEntry>;
};

export const netWorthResolvers = {
  NetWorthSnapshot: {
    snapshotDate: (parent: SnapshotParent) => {
      const date = parent.snapshotDate;
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    entries: async (parent: SnapshotParent) => {
      if (parent.entries !== undefined) {
        return parent.entries;
      }

      return prisma.netWorthEntry.findMany({
        where: { snapshotId: parent.id },
        orderBy: { createdAt: 'asc' },
      });
    },
    totalAssets: async (parent: SnapshotParent) => {
      const entries =
        parent.entries ??
        (await prisma.netWorthEntry.findMany({
          where: { snapshotId: parent.id },
        }));

      return entries
        .filter((entry) => entry.type === 'ASSET')
        .reduce((sum, entry) => sum + entry.amount, 0);
    },
    totalLiabilities: async (parent: SnapshotParent) => {
      const entries =
        parent.entries ??
        (await prisma.netWorthEntry.findMany({
          where: { snapshotId: parent.id },
        }));

      return entries
        .filter((entry) => entry.type === 'LIABILITY')
        .reduce((sum, entry) => sum + entry.amount, 0);
    },
    previousSnapshot: async (parent: SnapshotParent) => {
      return prisma.netWorthSnapshot.findFirst({
        where: {
          userId: parent.userId,
          snapshotDate: { lt: parent.snapshotDate },
        },
        orderBy: { snapshotDate: 'desc' },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    },
    netWorth: async (parent: SnapshotParent) => {
      const entries =
        parent.entries ??
        (await prisma.netWorthEntry.findMany({
          where: { snapshotId: parent.id },
        }));

      const assets = entries
        .filter((entry) => entry.type === 'ASSET')
        .reduce((sum, entry) => sum + entry.amount, 0);

      const liabilities = entries
        .filter((entry) => entry.type === 'LIABILITY')
        .reduce((sum, entry) => sum + entry.amount, 0);

      return assets - liabilities;
    },
  },
  Query: {
    netWorthSnapshots: async (
      _parent: unknown,
      {
        page = 1,
        pageSize = 10,
        search,
        sortBy = 'SNAPSHOT_DATE',
        sortOrder = 'DESC',
      }: NetWorthSnapshotsArgs,
      { userId }: { userId: string }
    ) => {
      const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
      const skip = (clampedPage - 1) * clampedPageSize;
      const trimmedSearch = search?.trim();
      const where = {
        userId,
        ...(trimmedSearch
          ? { title: { contains: trimmedSearch, mode: 'insensitive' as const } }
          : {}),
      };

      // Change is the delta versus the chronologically previous snapshot, which
      // depends on a snapshot's neighbours — the database can't order by it.
      // Pull the matching snapshots oldest-first, rank them by change, then
      // paginate in memory.
      if (sortBy === 'CHANGE') {
        const oldestFirst = await prisma.netWorthSnapshot.findMany({
          where,
          orderBy: { snapshotDate: 'asc' },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
        });
        const ranked = sortSnapshotsByChange(oldestFirst, sortOrder);

        return {
          items: ranked.slice(skip, skip + clampedPageSize),
          totalCount: ranked.length,
        };
      }

      const order = sortOrder === 'ASC' ? 'asc' : 'desc';
      const [items, totalCount] = await Promise.all([
        prisma.netWorthSnapshot.findMany({
          where,
          orderBy: { snapshotDate: order },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
          skip,
          take: clampedPageSize,
        }),
        prisma.netWorthSnapshot.count({ where }),
      ]);

      return { items, totalCount };
    },
    netWorthSnapshot: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      return prisma.netWorthSnapshot.findFirst({
        where: { id, userId },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    },
  },
  Mutation: {
    createNetWorthSnapshot: async (
      _parent: unknown,
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const data = parseInput(NetWorthSnapshotInput, input);

      return prisma.netWorthSnapshot.create({
        data: {
          title: data.title,
          snapshotDate: data.snapshotDate,
          userId,
          entries: {
            create: data.entries.map((entry) => ({
              type: entry.type,
              label: entry.label,
              amount: entry.amount,
              category: entry.category,
              notes: entry.notes ?? null,
            })),
          },
        },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    },
    updateNetWorthSnapshot: async (
      _parent: unknown,
      { id, input }: { id: string; input: unknown },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.netWorthSnapshot.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Net worth snapshot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const data = parseInput(NetWorthSnapshotInput, input);

      return prisma.netWorthSnapshot.update({
        where: { id },
        data: {
          title: data.title,
          snapshotDate: data.snapshotDate,
          entries: {
            deleteMany: {},
            create: data.entries.map((entry) => ({
              type: entry.type,
              label: entry.label,
              amount: entry.amount,
              category: entry.category,
              notes: entry.notes ?? null,
            })),
          },
        },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    },
    deleteNetWorthSnapshot: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.netWorthSnapshot.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new GraphQLError('Net worth snapshot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await prisma.netWorthSnapshot.delete({ where: { id } });

      return true;
    },
  },
};
