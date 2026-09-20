import { useUser } from '../../contexts/UserContext';
import {
  type Plan,
  type PlanEntitlements,
  type PlanLimitKey,
} from '../../types/plan';

type UsePlanResult = {
  canExportCsv: boolean;
  canShareReports: boolean;
  entitlements: PlanEntitlements | null;
  hasReachedLimit: (limit: PlanLimitKey, count: number) => boolean;
  isFree: boolean;
  isPro: boolean;
  limitFor: (limit: PlanLimitKey) => number | null;
  plan: Plan | null;
  trendMonthsLimit: number | null;
};

export function usePlan(): UsePlanResult {
  const { user } = useUser();
  const entitlements = user?.entitlements ?? null;

  const limitFor = (limit: PlanLimitKey) => entitlements?.[limit] ?? null;

  return {
    canExportCsv: entitlements?.canExportCsv ?? false,
    canShareReports: entitlements?.canShareReports ?? false,
    entitlements,
    hasReachedLimit: (limit, count) => {
      const maximum = limitFor(limit);

      return maximum !== null && count >= maximum;
    },
    isFree: user?.plan === 'FREE',
    isPro: user?.plan === 'PRO',
    limitFor,
    plan: user?.plan ?? null,
    trendMonthsLimit: entitlements?.maxTrendMonths ?? null,
  };
}
