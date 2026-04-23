import { GraphQLError } from 'graphql';

import { NetWorthEntry } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

interface NetWorthEntryInput {
  type: string;
  label: string;
  amount: number;
  category: string;
}

export interface CreateNetWorthSnapshotInput {
  title: string;
  snapshotDate: string;
  entries: Array<NetWorthEntryInput>;
}

export interface UpdateNetWorthSnapshotInput {
  title: string;
  snapshotDate: string;
  entries: Array<NetWorthEntryInput>;
}

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
      { page = 1, pageSize = 10 }: { page?: number; pageSize?: number },
      { userId }: { userId: string }
    ) => {
      const skip = (page - 1) * pageSize;
      const [items, totalCount] = await Promise.all([
        prisma.netWorthSnapshot.findMany({
          where: { userId },
          orderBy: { snapshotDate: 'desc' },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
          skip,
          take: pageSize,
        }),
        prisma.netWorthSnapshot.count({ where: { userId } }),
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
      { input }: { input: CreateNetWorthSnapshotInput },
      { userId }: { userId: string }
    ) => {
      return prisma.netWorthSnapshot.create({
        data: {
          title: input.title,
          snapshotDate: new Date(input.snapshotDate),
          userId,
          entries: {
            create: input.entries.map((entry) => ({
              type: entry.type,
              label: entry.label,
              amount: entry.amount,
              category: entry.category,
            })),
          },
        },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    },
    updateNetWorthSnapshot: async (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateNetWorthSnapshotInput },
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

      return prisma.netWorthSnapshot.update({
        where: { id },
        data: {
          title: input.title,
          snapshotDate: new Date(input.snapshotDate),
          entries: {
            deleteMany: {},
            create: input.entries.map((entry) => ({
              type: entry.type,
              label: entry.label,
              amount: entry.amount,
              category: entry.category,
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
