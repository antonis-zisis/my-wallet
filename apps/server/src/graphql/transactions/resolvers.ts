import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import {
  reportAccessWhere,
  resolveReportAccess,
} from '../reports/lib/reportAccess';
import { TransactionInput } from './inputSchemas';

export const transactionResolvers = {
  Query: {
    transactions: async (
      _parent: unknown,
      _args: unknown,
      { userId }: { userId: string }
    ) => {
      return prisma.transaction.findMany({
        where: { report: reportAccessWhere(userId) },
        orderBy: { date: 'desc' },
      });
    },
    transaction: async (
      _parent: unknown,
      { id }: { id: string },
      { userId }: { userId: string }
    ) => {
      return prisma.transaction.findFirst({
        where: { id, report: reportAccessWhere(userId) },
      });
    },
  },
  Mutation: {
    createTransaction: async (
      _parent: unknown,
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const { reportId } = input as { reportId: string };
      const access = await resolveReportAccess(reportId, userId);

      if (!access) {
        throw new GraphQLError('Report not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (access.role === 'VIEWER') {
        throw new GraphQLError('Viewers cannot modify transactions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (access.report.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const data = parseInput(TransactionInput, input);

      const transaction = await prisma.transaction.create({
        data: {
          reportId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          category: data.category,
          date: data.date,
          createdById: userId,
        },
      });

      await prisma.report.update({
        where: { id: reportId },
        data: { updatedAt: new Date() },
      });

      return transaction;
    },
    updateTransaction: async (
      _parent: unknown,
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const { id } = input as { id: string };
      const existing = await prisma.transaction.findFirst({
        where: { id, report: reportAccessWhere(userId) },
      });

      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const access = await resolveReportAccess(existing.reportId, userId);

      if (!access || access.role === 'VIEWER') {
        throw new GraphQLError('Viewers cannot modify transactions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (access.report.isLocked) {
        throw new GraphQLError('Report is locked', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const data = parseInput(TransactionInput, input);

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          category: data.category,
          date: data.date,
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
        where: { id, report: reportAccessWhere(userId) },
      });

      if (!existing) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const access = await resolveReportAccess(existing.reportId, userId);

      if (!access || access.role === 'VIEWER') {
        throw new GraphQLError('Viewers cannot modify transactions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (access.report.isLocked) {
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
