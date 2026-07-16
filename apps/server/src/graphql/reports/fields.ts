import { Transaction } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

type ReportParent = {
  id: string;
  transactions?: Array<Transaction>;
};

export const reportFields = {
  createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  transactionCount: async (parent: ReportParent) => {
    if (parent.transactions !== undefined) {
      return parent.transactions.length;
    }

    return prisma.transaction.count({ where: { reportId: parent.id } });
  },
  netBalance: async (parent: ReportParent) => {
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
  transactions: async (parent: ReportParent) => {
    if (parent.transactions !== undefined) {
      return parent.transactions;
    }

    return prisma.transaction.findMany({
      where: { reportId: parent.id },
      orderBy: { date: 'desc' },
    });
  },
};
