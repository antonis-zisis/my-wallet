import { type Plan, PLAN_LABELS } from '../../types/plan';
import { Badge } from '../ui';

type PlanBadgeProps = {
  plan: Plan;
};

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <Badge size="sm" variant={plan === 'PRO' ? 'info' : 'default'}>
      {PLAN_LABELS[plan]}
    </Badge>
  );
}
