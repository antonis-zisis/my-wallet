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
    reports: async () => {
      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.report.count(),
      ]);
      return { items, totalCount };
    },
    report: async (_parent: unknown, { id }: { id: string }) => {
      return prisma.report.findUnique({
        where: { id },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
    },
  },
  Mutation: {
    createReport: async (
      _parent: unknown,
      { input }: { input: CreateReportInput }
    ) => {
      return prisma.report.create({ data: { title: input.title } });
    },
    updateReport: async (
      _parent: unknown,
      { input }: { input: UpdateReportInput }
    ) => {
      return prisma.report.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    },
  },
};
