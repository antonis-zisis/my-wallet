import prisma from '../../lib/prisma';
import { clampPage } from '../../lib/validate';
import { buildSubscriptionsWhere } from './lib/buildSubscriptionsWhere';
import { computeMonthlyCost } from './lib/computeMonthlyCost';
import { getNextRenewalDate } from './lib/getNextRenewalDate';

export type SubscriptionsArgs = {
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'NAME' | 'MONTHLY_COST' | 'NEXT_RENEWAL';
  sortOrder?: 'ASC' | 'DESC';
};

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

    if (sortBy === 'MONTHLY_COST' || sortBy === 'NEXT_RENEWAL') {
      const [allItems, totalCount] = await Promise.all([
        prisma.subscription.findMany({ where }),
        prisma.subscription.count({ where }),
      ]);

      allItems.sort((left, right) => {
        const diff =
          sortBy === 'MONTHLY_COST'
            ? computeMonthlyCost(left) - computeMonthlyCost(right)
            : getNextRenewalDate(left.startDate, left.billingCycle).getTime() -
              getNextRenewalDate(right.startDate, right.billingCycle).getTime();

        return sortOrder === 'ASC' ? diff : -diff;
      });

      return {
        items: allItems.slice(skip, skip + clampedPageSize),
        totalCount,
      };
    }

    const [items, totalCount] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { name: order as 'asc' | 'desc' },
        skip,
        take: clampedPageSize,
      }),
      prisma.subscription.count({ where }),
    ]);

    return { items, totalCount };
  },
};
