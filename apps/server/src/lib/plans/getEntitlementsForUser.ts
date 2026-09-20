import prisma from '../prisma';
import { entitlementsForPlan, PlanEntitlements } from './entitlementsForPlan';

export async function getEntitlementsForUser(
  userId: string
): Promise<PlanEntitlements> {
  const user = await prisma.user.findUnique({
    where: { supabaseId: userId },
    select: { plan: true },
  });

  return entitlementsForPlan(user?.plan);
}
