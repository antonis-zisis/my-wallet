import prisma from '../../lib/prisma';
import { clampPage } from '../../lib/validate';
import { buildNetBalanceMap } from './lib/buildNetBalanceMap';

type ReportsArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'NEWEST' | 'NET_BALANCE';
  sortOrder?: 'ASC' | 'DESC';
};

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
};
