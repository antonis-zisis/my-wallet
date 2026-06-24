import prisma from '../../lib/prisma';
import { clampPage } from '../../lib/validate';
import { buildContractsWhere } from './lib/buildContractsWhere';

export type ContractsArgs = {
  expired?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'END_DATE' | 'PROVIDER';
  sortOrder?: 'ASC' | 'DESC';
};

export const contractQueryResolvers = {
  contracts: async (
    _parent: unknown,
    {
      expired,
      page = 1,
      pageSize = 10,
      sortBy = 'END_DATE',
      sortOrder = 'ASC',
    }: ContractsArgs,
    { userId }: { userId: string }
  ) => {
    const now = new Date();
    const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
    const skip = (clampedPage - 1) * clampedPageSize;
    const order = sortOrder === 'ASC' ? ('asc' as const) : ('desc' as const);

    const where = buildContractsWhere({ expired, now, userId });

    const orderBy =
      sortBy === 'PROVIDER'
        ? { provider: order }
        : { endDate: { sort: order, nulls: 'last' as const } };

    const [items, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy,
        skip,
        take: clampedPageSize,
      }),
      prisma.contract.count({ where }),
    ]);

    return { items, totalCount };
  },
};
