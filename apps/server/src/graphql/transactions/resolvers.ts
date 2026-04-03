import { GraphQLError } from 'graphql';

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
    transactions: async (
      _parent: unknown,
      _args: unknown,
      { userId }: { userId: string }
    ) => {
      return prisma.transaction.findMany({
        where: { report: { userId } },
        orderBy: { date: 'desc' },
      });
    },
    transaction: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      return prisma.transaction.findFirst({
        where: { id, report: { userId } },
      });
    },
  },
  Mutation: {
    createTransaction: async (
      _parent: unknown,
      { input }: { input: CreateTransactionInput },
      { userId }: { userId: string }
    ) => {
      const report = await prisma.report.findFirst({
        where: { id: input.reportId, userId },
      });
      if (!report) {
        throw new GraphQLError('Report not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
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
      { input }: { input: UpdateTransactionInput },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.transaction.findFirst({
        where: { id: input.id, report: { userId } },
      });
      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
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
    deleteTransaction: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.transaction.findFirst({
        where: { id, report: { userId } },
      });
      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await prisma.transaction.delete({ where: { id } });
      return true;
    },
  },
};
