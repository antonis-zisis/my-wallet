import prisma from '../lib/prisma';

interface CreateTransactionInput {
  reportId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface CreateReportInput {
  title: string;
}

export const resolvers = {
  Query: {
    transactions: async () => {
      return prisma.transaction.findMany({ orderBy: { date: 'desc' } });
    },
    transaction: async (_parent: unknown, { id }: { id: string }) => {
      return prisma.transaction.findUnique({ where: { id } });
    },
    reports: async () => {
      return prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
    },
    report: async (_parent: unknown, { id }: { id: string }) => {
      return prisma.report.findUnique({
        where: { id },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
    },
    health: () => {
      return 'GraphQL server is running!';
    },
  },
  Mutation: {
    createTransaction: async (
      _parent: unknown,
      { input }: { input: CreateTransactionInput }
    ) => {
      return prisma.transaction.create({
        data: {
          reportId: input.reportId,
          type: input.type,
          amount: input.amount,
          description: input.description,
          category: input.category,
          date: new Date(input.date),
        },
      });
    },
    deleteTransaction: async (_parent: unknown, { id }: { id: string }) => {
      await prisma.transaction.delete({ where: { id } });
      return true;
    },
    createReport: async (
      _parent: unknown,
      { input }: { input: CreateReportInput }
    ) => {
      return prisma.report.create({ data: { title: input.title } });
    },
  },
};
