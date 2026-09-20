import { Link } from 'react-router';

import { usePlan } from '../../hooks/plan/usePlan';
import { usePlanUsage } from '../../hooks/plan/usePlanUsage';
import {
  PLAN_LIMIT_LABELS,
  PLAN_USAGE_KEYS,
  type PlanLimitKey,
} from '../../types/plan';

type PlanUsageHintProps = {
  limit: PlanLimitKey;
};

export function PlanUsageHint({ limit }: PlanUsageHintProps) {
  const { limitFor } = usePlan();
  const { usage } = usePlanUsage();

  const maximum = limitFor(limit);

  if (maximum === null || !usage) {
    return null;
  }

  const used = usage[PLAN_USAGE_KEYS[limit]];

  return (
    <p className="text-text-tertiary text-xs">
      {Math.min(used, maximum)} of {maximum} {PLAN_LIMIT_LABELS[limit]} used on
      Free.{' '}
      <Link to="/select-plan" className="underline">
        {used >= maximum ? 'Upgrade for unlimited' : 'See Pro'}
      </Link>
    </p>
  );
}
