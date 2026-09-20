import { type PlanEntitlements, type PlanOption } from '../../types/plan';

export function makePlanEntitlements(
  overrides: Partial<PlanEntitlements> = {}
): PlanEntitlements {
  return {
    canExportCsv: true,
    canShareReports: true,
    maxContracts: null,
    maxNetWorthSnapshots: null,
    maxReports: null,
    maxSubscriptions: null,
    maxTrendMonths: 12,
    ...overrides,
  };
}

export const FREE_ENTITLEMENTS: PlanEntitlements = {
  canExportCsv: false,
  canShareReports: false,
  maxContracts: 3,
  maxNetWorthSnapshots: 1,
  maxReports: 3,
  maxSubscriptions: 3,
  maxTrendMonths: 3,
};

export function makePlanOptions(): Array<PlanOption> {
  return [
    { plan: 'FREE', entitlements: FREE_ENTITLEMENTS },
    { plan: 'PRO', entitlements: makePlanEntitlements() },
  ];
}
