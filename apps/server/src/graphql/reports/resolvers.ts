import { GraphQLError } from 'graphql';

import { Transaction } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

export interface CreateReportInput {
  title: string;
}

export interface UpdateReportInput {
  id: string;
  title: string;
}

export const reportResolvers = {
  Report: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    transactions: async (parent: {
      id: string;
      transactions?: Array<Transaction>;
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
      { page = 1, pageSize = 10 }: { page?: number; pageSize?: number },
      { userId }: { userId: string }
    ) => {
      const skip = (page - 1) * pageSize;
      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
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

      if (existing.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
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

      if (existing.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await prisma.report.delete({ where: { id } });

      return true;
    },
    lockReport: async (
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

      return prisma.report.update({ where: { id }, data: { isLocked: true } });
    },
    unlockReport: async (
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

      return prisma.report.update({ where: { id }, data: { isLocked: false } });
    },
  },
};
