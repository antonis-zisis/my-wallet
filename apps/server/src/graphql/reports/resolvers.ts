import { GraphQLError } from 'graphql';

import { Transaction } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { clampPage, parseInput } from '../../lib/validate';
import { ReportInput } from './inputSchemas';
import { buildNetBalanceMap } from './lib/buildNetBalanceMap';

type ReportsArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'NEWEST' | 'NET_BALANCE';
  sortOrder?: 'ASC' | 'DESC';
};

export const reportResolvers = {
  Report: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    transactionCount: async (parent: {
      id: string;
      transactions?: Array<Transaction>;
    }) => {
      if (parent.transactions !== undefined) {
        return parent.transactions.length;
      }

      return prisma.transaction.count({ where: { reportId: parent.id } });
    },
    netBalance: async (parent: {
      id: string;
      transactions?: Array<Transaction>;
    }) => {
      if (parent.transactions !== undefined) {
        return parent.transactions.reduce((balance, transaction) => {
          return transaction.type === 'INCOME'
            ? balance + transaction.amount
            : balance - transaction.amount;
        }, 0);
      }

      const [incomeResult, expenseResult] = await Promise.all([
        prisma.transaction.aggregate({
          where: { reportId: parent.id, type: 'INCOME' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { reportId: parent.id, type: 'EXPENSE' },
          _sum: { amount: true },
        }),
      ]);

      return (incomeResult._sum.amount ?? 0) - (expenseResult._sum.amount ?? 0);
    },
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
      {
        page = 1,
        pageSize = 10,
        search,
        sortBy = 'NEWEST',
        sortOrder = 'DESC',
      }: ReportsArgs,
      { userId }: { userId: string }
    ) => {
      const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
      const skip = (clampedPage - 1) * clampedPageSize;
      const trimmedSearch = search?.trim();
      const where = {
        userId,
        ...(trimmedSearch
          ? { title: { contains: trimmedSearch, mode: 'insensitive' as const } }
          : {}),
      };

      if (sortBy === 'NET_BALANCE') {
        const allReports = await prisma.report.findMany({ where });
        const grouped = await prisma.transaction.groupBy({
          by: ['reportId', 'type'],
          where: { reportId: { in: allReports.map((report) => report.id) } },
          _sum: { amount: true },
        });
        const netBalanceByReport = buildNetBalanceMap(grouped);

        allReports.sort((left, right) => {
          const difference =
            (netBalanceByReport.get(left.id) ?? 0) -
            (netBalanceByReport.get(right.id) ?? 0);

          return sortOrder === 'ASC' ? difference : -difference;
        });

        return {
          items: allReports.slice(skip, skip + clampedPageSize),
          totalCount: allReports.length,
        };
      }

      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: clampedPageSize,
        }),
        prisma.report.count({ where }),
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
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const data = parseInput(ReportInput, input);

      return prisma.report.create({ data: { title: data.title, userId } });
    },
    updateReport: async (
      _parent: unknown,
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const { id } = input as { id: string };
      const existing = await prisma.report.findFirst({
        where: { id, userId },
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

      const data = parseInput(ReportInput, input);

      return prisma.report.update({
        where: { id },
        data: { title: data.title },
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
