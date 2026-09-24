import type { GraphQLResolveInfo } from 'graphql';

import prisma from '../../lib/prisma';
import { selectsItemField } from '../../lib/selectsItemField';
import { clampPage } from '../../lib/validate';
import { transactionOrderBy } from '../transactions/lib/transactionOrderBy';
import { attachReportMembers } from './lib/attachReportMembers';
import { attachReportTotals } from './lib/attachReportTotals';
import { attachReportTransactions } from './lib/attachReportTransactions';
import { buildNetBalanceMap } from './lib/buildNetBalanceMap';
import { reportAccessWhere } from './lib/reportAccess';

type ReportsArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'NEWEST' | 'NET_BALANCE';
  sortOrder?: 'ASC' | 'DESC';
};

type ReportListItem = { id: string; userId: string };

async function attachListFields<ReportItem extends ReportListItem>(
  reports: Array<ReportItem>,
  withTransactions: boolean
) {
  const withMembers = await attachReportMembers(reports);

  if (withTransactions) {
    return attachReportTransactions(withMembers);
  }

  return attachReportTotals(withMembers);
}

export const reportQueries = {
  reports: async (
    _parent: unknown,
    {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'NEWEST',
      sortOrder = 'DESC',
    }: ReportsArgs,
    { userId }: { userId: string },
    info: GraphQLResolveInfo
  ) => {
    const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
    const withTransactions = selectsItemField(info, 'transactions');
    const skip = (clampedPage - 1) * clampedPageSize;
    const trimmedSearch = search?.trim();
    const where = {
      ...reportAccessWhere(userId),
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
        items: await attachListFields(
          allReports.slice(skip, skip + clampedPageSize),
          withTransactions
        ),
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

    return {
      items: await attachListFields(items, withTransactions),
      totalCount,
    };
  },
  report: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    return prisma.report.findFirst({
      where: { id, ...reportAccessWhere(userId) },
      include: { transactions: { orderBy: transactionOrderBy } },
    });
  },
};
