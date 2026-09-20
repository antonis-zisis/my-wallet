import { Link, useNavigate } from 'react-router';

import { PlanCard } from '../components/plan/PlanCard';
import { PageLayout, Skeleton } from '../components/ui';
import { usePlanData } from '../hooks/plan/usePlanData';
import { type Plan } from '../types/plan';

function ctaLabelFor(plan: Plan, currentPlan: Plan | null): string {
  if (currentPlan === plan) {
    return 'Current plan';
  }

  if (currentPlan === null) {
    return plan === 'PRO' ? 'Start with Pro' : 'Start with Free';
  }

  return plan === 'PRO' ? 'Upgrade to Pro' : 'Switch to Free';
}

export function SelectPlan() {
  const navigate = useNavigate();
  const {
    comparison,
    currentPlan,
    error,
    loading,
    onSelectPlan,
    selectingPlan,
  } = usePlanData();

  const handleSelect = async (plan: Plan) => {
    const hasChanged = await onSelectPlan(plan);

    if (hasChanged) {
      navigate('/');
    }
  };

  return (
    <PageLayout className="max-w-3xl">
      <header className="mb-6 text-center">
        <h1 className="text-text-primary text-2xl font-semibold">
          Choose your plan
        </h1>

        <p className="text-text-secondary mt-1 text-sm">
          Start free and upgrade when you outgrow it. Your data is never hidden
          or deleted if you switch back.
        </p>
      </header>

      {error && (
        <p className="text-text-secondary text-center text-sm">
          We could not load the plans. Please refresh and try again.
        </p>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard
            ctaLabel={ctaLabelFor('FREE', currentPlan)}
            isCurrent={currentPlan === 'FREE'}
            isSelecting={selectingPlan === 'FREE'}
            plan="FREE"
            rows={comparison.map((row) => ({
              label: row.label,
              value: row.free,
            }))}
            onSelect={() => handleSelect('FREE')}
          />

          <PlanCard
            ctaLabel={ctaLabelFor('PRO', currentPlan)}
            isCurrent={currentPlan === 'PRO'}
            isRecommended
            isSelecting={selectingPlan === 'PRO'}
            plan="PRO"
            rows={comparison.map((row) => ({
              label: row.label,
              value: row.pro,
            }))}
            onSelect={() => handleSelect('PRO')}
          />
        </div>
      )}

      {currentPlan && (
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-text-secondary hover:text-text-primary text-sm underline"
          >
            Back to the app
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
