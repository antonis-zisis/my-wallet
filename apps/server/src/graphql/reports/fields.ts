import { GraphQLError } from 'graphql';

import { Transaction } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { attachReportMembers } from './lib/attachReportMembers';
import { ReportMemberRecord } from './lib/buildMembersByReport';

type ReportParent = {
  id: string;
  userId: string;
  transactions?: Array<Transaction>;
  members?: Array<ReportMemberRecord>;
};

async function loadMembers(parent: ReportParent) {
  if (parent.members !== undefined) {
    return parent.members;
  }

  const [reportWithMembers] = await attachReportMembers([parent]);

  return reportWithMembers.members;
}

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
  members: (parent: ReportParent) => loadMembers(parent),
  myRole: async (
    parent: ReportParent,
    _args: unknown,
    { userId }: { userId: string }
  ) => {
    if (parent.userId === userId) {
      return 'OWNER';
    }

    const members = await loadMembers(parent);
    const member = members.find((candidate) => candidate.userId === userId);

    if (!member) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return member.role;
  },
};
