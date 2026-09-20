import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { CheckoutStatusPanel } from '../components/plan/CheckoutStatusPanel';
import { PlanCard } from '../components/plan/PlanCard';
import { PlanIntervalToggle } from '../components/plan/PlanIntervalToggle';
import { PageLayout, Skeleton } from '../components/ui';
import { useBillingData } from '../hooks/billing/useBillingData';
import { useBillingPortal } from '../hooks/billing/useBillingPortal';
import { useCheckoutCompletion } from '../hooks/billing/useCheckoutCompletion';
import {
  buildPlanCta,
  type PlanCtaAction,
} from '../hooks/plan/selectors/buildPlanCta';
import { usePlanData } from '../hooks/plan/usePlanData';
import { type BillingInterval } from '../types/billing';

export function SelectPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [interval, setInterval] = useState<BillingInterval>('MONTH');

  const {
    comparison,
    currentPlan,
    error,
    loading,
    onSelectPlan,
    selectingPlan,
  } = usePlanData();
  const {
    intervalOptions,
    isCheckoutAvailable,
    isStartingCheckout,
    onUpgrade,
  } = useBillingData();
  const { isOpeningPortal, onManageBilling } = useBillingPortal();

  const isReturningFromCheckout = searchParams.get('checkout') === 'success';
  const { hasTimedOut, isFinalizing } = useCheckoutCompletion({
    isReturningFromCheckout,
  });

  const selectedOption =
    intervalOptions.find((option) => option.interval === interval) ??
    intervalOptions[0];

  const handleSelectFree = async () => {
    const hasChanged = await onSelectPlan('FREE');

    if (hasChanged) {
      navigate('/');
    }
  };

  const handlers: Record<PlanCtaAction, () => void> = {
    CHECKOUT: () => onUpgrade(selectedOption?.interval ?? 'MONTH'),
    CURRENT: () => undefined,
    PORTAL: onManageBilling,
    SELECT_FREE: handleSelectFree,
    UNAVAILABLE: () => undefined,
  };

  const freeCta = buildPlanCta({
    currentPlan,
    isCheckoutAvailable,
    plan: 'FREE',
  });
  const proCta = buildPlanCta({
    currentPlan,
    isCheckoutAvailable,
    plan: 'PRO',
  });

  if (isReturningFromCheckout) {
    return (
      <PageLayout className="max-w-xl">
        <CheckoutStatusPanel
          state={
            isFinalizing ? 'FINALIZING' : hasTimedOut ? 'TIMED_OUT' : 'UPGRADED'
          }
          onRefresh={() => navigate(0)}
        />
      </PageLayout>
    );
  }

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

      {searchParams.get('checkout') === 'cancelled' && (
        <p className="text-text-secondary mb-6 text-center text-sm">
          Checkout cancelled — nothing was charged.
        </p>
      )}

      {intervalOptions.length > 1 && (
        <div className="mb-6 flex justify-center">
          <PlanIntervalToggle
            options={intervalOptions}
            value={selectedOption?.interval ?? 'MONTH'}
            onChange={setInterval}
          />
        </div>
      )}

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
            ctaLabel={freeCta.label}
            isCurrent={freeCta.action === 'CURRENT'}
            isSelecting={selectingPlan === 'FREE' || isOpeningPortal}
            plan="FREE"
            priceLabel="Free forever"
            rows={comparison.map((row) => ({
              label: row.label,
              value: row.free,
            }))}
            onSelect={handlers[freeCta.action]}
          />

          <PlanCard
            ctaLabel={proCta.label}
            isCurrent={proCta.action === 'CURRENT'}
            isDisabled={proCta.action === 'UNAVAILABLE'}
            isRecommended
            isSelecting={isStartingCheckout}
            plan="PRO"
            priceLabel={selectedOption?.priceLabel}
            rows={comparison.map((row) => ({
              label: row.label,
              value: row.pro,
            }))}
            onSelect={handlers[proCta.action]}
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
