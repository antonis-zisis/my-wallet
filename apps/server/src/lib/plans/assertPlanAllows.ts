import { GraphQLError } from 'graphql';

import { PlanEntitlements } from './entitlementsForPlan';
import { getEntitlementsForUser } from './getEntitlementsForUser';

type PlanCapabilityKey = {
  [Key in keyof PlanEntitlements]: PlanEntitlements[Key] extends boolean
    ? Key
    : never;
}[keyof PlanEntitlements];

type AssertPlanAllowsInput = {
  capability: PlanCapabilityKey;
  userId: string;
};

const PLAN_CAPABILITY_MESSAGES: Record<PlanCapabilityKey, string> = {
  canExportCsv: 'Exporting to CSV is a Pro feature. Upgrade to export reports.',
  canShareReports:
    'Sharing reports is a Pro feature. Upgrade to share this report.',
};

export async function assertPlanAllows({
  capability,
  userId,
}: AssertPlanAllowsInput): Promise<void> {
  const entitlements = await getEntitlementsForUser(userId);

  if (entitlements[capability]) {
    return;
  }

  throw new GraphQLError(PLAN_CAPABILITY_MESSAGES[capability], {
    extensions: {
      code: 'FORBIDDEN',
      reason: 'PLAN_LIMIT',
      capability,
    },
  });
}
