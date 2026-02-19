import { GraphQLError } from 'graphql';

import { Transaction } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

const PAGE_SIZE = 20;

export interface CreateReportInput {
  title: string;
}

export interface UpdateReportInput {
  id: string;
  title: string;
}

export const reportResolvers = {
  Report: {
    transactions: async (parent: {
      id: string;
      transactions?: Transaction[];
    }) => {
      if (parent.transactions !== undefined) {
        return parent.transactions;
      }
      return prisma.transaction.findMany({
        where: { reportId: parent.id },
        orderBy: { date: 'desc' },
      });
    },
  },
  Query: {
    reports: async (
      _parent: unknown,
      { page = 1 }: { page?: number },
      { userId }: { userId: string }
    ) => {
      const skip = (page - 1) * PAGE_SIZE;
      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.report.count({ where: { userId } }),
      ]);
      return { items, totalCount };
    },
    report: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      return prisma.report.findFirst({
        where: { id, userId },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
    },
  },
  Mutation: {
    createReport: async (
      _parent: unknown,
      { input }: { input: CreateReportInput },
      { userId }: { userId: string }
    ) => {
      return prisma.report.create({ data: { title: input.title, userId } });
    },
    updateReport: async (
      _parent: unknown,
      { input }: { input: UpdateReportInput },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.report.findFirst({
        where: { id: input.id, userId },
      });
      if (!existing) {
        throw new GraphQLError('Report not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return prisma.report.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    },
    deleteReport: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.report.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new GraphQLError('Report not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await prisma.report.delete({ where: { id } });
      return true;
    },
  },
};
