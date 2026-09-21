import { GraphQLError, type GraphQLResolveInfo } from 'graphql';

import prisma from '../../lib/prisma';
import { selectsItemField } from '../../lib/selectsItemField';
import {
  countActiveUsersSince,
  countRegisteredUsers,
} from '../../lib/stats/countUsers';
import { getOnboardingFunnel } from '../../lib/stats/getOnboardingFunnel';
import { getSignupsByWeek } from '../../lib/stats/getSignupsByWeek';
import { clampPage } from '../../lib/validate';
import { attachUserActivityCounts } from './lib/attachUserActivityCounts';
import { buildAdminUsersWhere } from './lib/buildAdminUsersWhere';
import { requireSuperadmin } from './lib/requireSuperadmin';

const USER_COUNT_SELECT = {
  contracts: true,
  netWorthSnapshots: true,
  reports: true,
  reportShares: true,
  subscriptions: true,
} as const;

export type AdminUsersArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'CREATED_AT' | 'EMAIL' | 'LAST_SEEN_AT';
  sortOrder?: 'ASC' | 'DESC';
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const adminQueryResolvers = {
  adminInsights: async (
    _parent: unknown,
    _args: unknown,
    { userId }: { userId: string }
  ) => {
    await requireSuperadmin(userId);

    const now = Date.now();
    const since = (days: number) => new Date(now - days * DAY_MS);

    const [
      activeUsers24h,
      activeUsers7d,
      activeUsers30d,
      registeredUsers,
      onboardingFunnel,
      signupsByWeek,
    ] = await Promise.all([
      countActiveUsersSince(since(1)),
      countActiveUsersSince(since(7)),
      countActiveUsersSince(since(30)),
      countRegisteredUsers(),
      getOnboardingFunnel(),
      getSignupsByWeek(),
    ]);

    return {
      activeUsers24h,
      activeUsers30d,
      activeUsers7d,
      onboardingFunnel,
      registeredUsers,
      signupsByWeek,
    };
  },
  adminUsers: async (
    _parent: unknown,
    {
      page = 1,
      pageSize = 20,
      search,
      sortBy = 'CREATED_AT',
      sortOrder = 'DESC',
    }: AdminUsersArgs,
    { userId }: { userId: string },
    info: GraphQLResolveInfo
  ) => {
    await requireSuperadmin(userId);

    const { clampedPage, clampedPageSize } = clampPage(page, pageSize);
    const skip = (clampedPage - 1) * clampedPageSize;
    const order = sortOrder === 'ASC' ? ('asc' as const) : ('desc' as const);
    const where = buildAdminUsersWhere({ search });

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: buildOrderBy(sortBy, order),
        skip,
        take: clampedPageSize,
        include: { _count: { select: USER_COUNT_SELECT } },
      }),
      prisma.user.count({ where }),
    ]);

    const items = selectsItemField(info, 'counts')
      ? await attachUserActivityCounts(users)
      : users;

    return { items, totalCount };
  },
  adminUser: async (
    _parent: unknown,
    { supabaseId }: { supabaseId: string },
    { userId }: { userId: string }
  ) => {
    await requireSuperadmin(userId);

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: { _count: { select: USER_COUNT_SELECT } },
    });

    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const [userWithCounts] = await attachUserActivityCounts([user]);

    return userWithCounts;
  },
};

function buildOrderBy(
  sortBy: NonNullable<AdminUsersArgs['sortBy']>,
  order: 'asc' | 'desc'
) {
  if (sortBy === 'EMAIL') {
    return { email: order };
  }

  if (sortBy === 'LAST_SEEN_AT') {
    return { lastSeenAt: { sort: order, nulls: 'last' as const } };
  }

  return { createdAt: order };
}
