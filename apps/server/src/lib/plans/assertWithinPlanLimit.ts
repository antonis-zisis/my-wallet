import { GraphQLError } from 'graphql';

import { PlanEntitlements } from './entitlementsForPlan';
import { getEntitlementsForUser } from './getEntitlementsForUser';

type PlanLimitKey = {
  [Key in keyof PlanEntitlements]: null extends PlanEntitlements[Key]
    ? Key
    : never;
}[keyof PlanEntitlements];

type AssertWithinPlanLimitInput = {
  countCurrent: () => Promise<number>;
  limit: PlanLimitKey;
  userId: string;
};

const PLAN_LIMIT_LABELS: Record<
  PlanLimitKey,
  { plural: string; singular: string }
> = {
  maxContracts: { plural: 'contracts', singular: 'contract' },
  maxNetWorthSnapshots: {
    plural: 'net worth snapshots',
    singular: 'net worth snapshot',
  },
  maxReports: { plural: 'reports', singular: 'report' },
  maxSubscriptions: {
    plural: 'active subscriptions',
    singular: 'active subscription',
  },
};

export async function assertWithinPlanLimit({
  countCurrent,
  limit,
  userId,
}: AssertWithinPlanLimitInput): Promise<void> {
  const entitlements = await getEntitlementsForUser(userId);
  const maximum = entitlements[limit];

  if (maximum === null) {
    return;
  }

  const current = await countCurrent();

  if (current < maximum) {
    return;
  }

  const label = PLAN_LIMIT_LABELS[limit];
  const noun = maximum === 1 ? label.singular : label.plural;

  throw new GraphQLError(
    `The Free plan is limited to ${maximum} ${noun}. Upgrade to Pro for unlimited ${label.plural}.`,
    {
      extensions: {
        code: 'FORBIDDEN',
        reason: 'PLAN_LIMIT',
        limit,
        maximum,
      },
    }
  );
}
