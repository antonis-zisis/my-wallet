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

      if (report.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          reportId: input.reportId,
          type: input.type,
          amount: input.amount,
          description: input.description,
          category: input.category,
          date: new Date(input.date),
        },
      });

      await prisma.report.update({
        where: { id: input.reportId },
        data: { updatedAt: new Date() },
      });

      return transaction;
    },
    updateTransaction: async (
      _parent: unknown,
      { input }: { input: UpdateTransactionInput },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.transaction.findFirst({
        where: { id: input.id, report: { userId } },
        include: { report: true },
      });

      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (existing.report.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const transaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          type: input.type,
          amount: input.amount,
          description: input.description,
          category: input.category,
          date: new Date(input.date),
        },
      });

      await prisma.report.update({
        where: { id: existing.reportId },
        data: { updatedAt: new Date() },
      });
      return transaction;
    },
    deleteTransaction: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      const existing = await prisma.transaction.findFirst({
        where: { id, report: { userId } },
        include: { report: true },
      });

      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (existing.report.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await prisma.transaction.delete({ where: { id } });
      await prisma.report.update({
        where: { id: existing.reportId },
        data: { updatedAt: new Date() },
      });

      return true;
    },
  },
};
