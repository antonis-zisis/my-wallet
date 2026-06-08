import prisma from '../../lib/prisma';
import { clampPage } from '../../lib/validate';
import { buildSubscriptionsWhere } from './lib/buildSubscriptionsWhere';
import { computeMonthlyCost } from './lib/computeMonthlyCost';

export interface SubscriptionsArgs {
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'NAME' | 'MONTHLY_COST' | 'NEXT_RENEWAL';
  sortOrder?: 'ASC' | 'DESC';
}

export const subscriptionQueryResolvers = {
  subscriptions: async (
    _parent: unknown,
    {
      active,
      page = 1,
      pageSize = 10,
      sortBy = 'NAME',
      sortOrder = 'ASC',
    }: SubscriptionsArgs,
    { userId }: { userId: string }
  ) => {
    const now = new Date();
    const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
    const skip = (clampedPage - 1) * clampedPageSize;
    const order = sortOrder === 'ASC' ? 'asc' : 'desc';

    const where = buildSubscriptionsWhere({ active, now, userId });

    if (sortBy === 'MONTHLY_COST') {
      const [allItems, totalCount] = await Promise.all([
        prisma.subscription.findMany({ where }),
        prisma.subscription.count({ where }),
      ]);

      allItems.sort((left, right) => {
        const diff = computeMonthlyCost(left) - computeMonthlyCost(right);

        return sortOrder === 'ASC' ? diff : -diff;
      });

      return {
        items: allItems.slice(skip, skip + clampedPageSize),
        totalCount,
      };
    }

    const orderBy =
      sortBy === 'NEXT_RENEWAL'
        ? { startDate: order as 'asc' | 'desc' }
        : { name: order as 'asc' | 'desc' };

    const [items, totalCount] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy,
        skip,
        take: clampedPageSize,
      }),
      prisma.subscription.count({ where }),
    ]);

    return { items, totalCount };
  },
};
