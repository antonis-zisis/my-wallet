import { useUser } from '../../contexts/UserContext';
import { type PlanStatus } from '../../types/billing';

type UseBillingStatusResult = {
  canManageBilling: boolean;
  isPastDue: boolean;
  planCancelAtPeriodEnd: boolean;
  planRenewsAt: string | null;
  planStatus: PlanStatus | null;
};

export function useBillingStatus(): UseBillingStatusResult {
  const { user } = useUser();

  return {
    canManageBilling: user?.canManageBilling ?? false,
    isPastDue: user?.planStatus === 'PAST_DUE',
    planCancelAtPeriodEnd: user?.planCancelAtPeriodEnd ?? false,
    planRenewsAt: user?.planRenewsAt ?? null,
    planStatus: user?.planStatus ?? null,
  };
}
