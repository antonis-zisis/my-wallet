import { PLANS } from '../validate/enums';

export type Plan = (typeof PLANS)[number];

export type PlanEntitlements = {
  canExportCsv: boolean;
  canShareReports: boolean;
  maxContracts: number | null;
  maxNetWorthSnapshots: number | null;
  maxReports: number | null;
  maxSubscriptions: number | null;
  maxTrendMonths: number;
};

const FREE_ENTITLEMENTS: PlanEntitlements = {
  canExportCsv: false,
  canShareReports: false,
  maxContracts: 3,
  maxNetWorthSnapshots: 1,
  maxReports: 3,
  maxSubscriptions: 3,
  maxTrendMonths: 3,
};

const PRO_ENTITLEMENTS: PlanEntitlements = {
  canExportCsv: true,
  canShareReports: true,
  maxContracts: null,
  maxNetWorthSnapshots: null,
  maxReports: null,
  maxSubscriptions: null,
  maxTrendMonths: 12,
};

export function entitlementsForPlan(
  plan: string | null | undefined
): PlanEntitlements {
  return plan === 'PRO' ? PRO_ENTITLEMENTS : FREE_ENTITLEMENTS;
}
