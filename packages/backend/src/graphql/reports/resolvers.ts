import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';

export interface CreateReportInput {
  title: string;
}

export interface UpdateReportInput {
  id: string;
  title: string;
}

export const reportResolvers = {
  Query: {
    reports: async (
      _parent: unknown,
      _args: unknown,
      { userId }: { userId: string }
    ) => {
      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
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
