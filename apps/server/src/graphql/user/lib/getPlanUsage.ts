import prisma from '../../../lib/prisma';
import { buildSubscriptionsWhere } from '../../subscriptions/lib/buildSubscriptionsWhere';

export type PlanUsage = {
  activeSubscriptions: number;
  contracts: number;
  netWorthSnapshots: number;
  reports: number;
};

export async function getPlanUsage(userId: string): Promise<PlanUsage> {
  const [activeSubscriptions, contracts, netWorthSnapshots, reports] =
    await Promise.all([
      prisma.subscription.count({
        where: buildSubscriptionsWhere({
          userId,
          active: true,
          now: new Date(),
        }),
      }),
      prisma.contract.count({ where: { userId } }),
      prisma.netWorthSnapshot.count({ where: { userId } }),
      prisma.report.count({ where: { userId } }),
    ]);

  return { activeSubscriptions, contracts, netWorthSnapshots, reports };
}
