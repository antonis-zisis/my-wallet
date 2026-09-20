import { Link } from 'react-router';

import { usePlan } from '../../hooks/plan/usePlan';
import { usePlanUsage } from '../../hooks/plan/usePlanUsage';
import {
  PLAN_LIMIT_LABELS,
  PLAN_USAGE_KEYS,
  type PlanLimitKey,
} from '../../types/plan';
import { CreditCardIcon } from '../icons';
import { Card } from '../ui';
import { PlanBadge } from './PlanBadge';

const USAGE_ROWS: Array<PlanLimitKey> = [
  'maxReports',
  'maxSubscriptions',
  'maxContracts',
  'maxNetWorthSnapshots',
];

export function ProfilePlanCard() {
  const { isPro, limitFor, plan } = usePlan();
  const { usage } = usePlanUsage();

  if (!plan) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="border-border mb-5 flex items-center gap-3 border-b pb-4">
        <div className="bg-bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded">
          <span className="text-text-secondary h-4 w-4">
            <CreditCardIcon />
          </span>
        </div>
        <div>
          <h2 className="text-text-primary text-sm font-semibold">Plan</h2>
          <p className="text-text-secondary text-xs">
            What your account currently includes
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <PlanBadge plan={plan} />

        <span className="text-text-secondary text-sm">
          {isPro
            ? 'Everything is unlimited.'
            : 'Upgrade any time — nothing you have added is ever hidden.'}
        </span>
      </div>

      {!isPro && usage && (
        <dl className="mb-4 flex flex-col gap-2">
          {USAGE_ROWS.map((limit) => {
            const maximum = limitFor(limit);

            if (maximum === null) {
              return null;
            }

            return (
              <div
                key={limit}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <dt className="text-text-secondary capitalize">
                  {PLAN_LIMIT_LABELS[limit]}
                </dt>
                <dd className="text-text-primary font-medium">
                  {Math.min(usage[PLAN_USAGE_KEYS[limit]], maximum)} / {maximum}
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      <Link
        to="/select-plan"
        className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline"
      >
        {isPro ? 'View plans' : 'Compare plans'}
      </Link>
    </Card>
  );
}
