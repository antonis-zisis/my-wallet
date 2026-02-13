import prisma from '../../lib/prisma';

export interface CreateTransactionInput {
  reportId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface UpdateTransactionInput {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const transactionResolvers = {
  Query: {
    transactions: async () => {
      return prisma.transaction.findMany({ orderBy: { date: 'desc' } });
    },
    transaction: async (_parent: unknown, { id }: { id: string }) => {
      return prisma.transaction.findUnique({ where: { id } });
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
    updateTransaction: async (
      _parent: unknown,
      { input }: { input: UpdateTransactionInput }
    ) => {
      return prisma.transaction.update({
        where: { id: input.id },
        data: {
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
  },
};
