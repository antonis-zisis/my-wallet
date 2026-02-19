import { GraphQLError } from 'graphql';

import { NetWorthEntry } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

const PAGE_SIZE = 20;

interface NetWorthEntryInput {
  type: string;
  label: string;
  amount: number;
  category: string;
}

export interface CreateNetWorthSnapshotInput {
  title: string;
  entries: NetWorthEntryInput[];
}

type SnapshotParent = {
  id: string;
  entries?: NetWorthEntry[];
};

export const netWorthResolvers = {
  NetWorthSnapshot: {
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
      { page = 1 }: { page?: number },
      { userId }: { userId: string }
    ) => {
      const skip = (page - 1) * PAGE_SIZE;
      const [items, totalCount] = await Promise.all([
        prisma.netWorthSnapshot.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
          skip,
          take: PAGE_SIZE,
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
