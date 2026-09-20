import { type PlanEntitlements, type PlanOption } from '../../../types/plan';

export type PlanComparisonRow = {
  free: string;
  label: string;
  pro: string;
};

type RowDefinition = {
  label: string;
  value: (entitlements: PlanEntitlements) => string;
};

function formatLimit(value: number | null): string {
  return value === null ? 'Unlimited' : String(value);
}

function formatCapability(included: boolean): string {
  return included ? 'Included' : 'Not included';
}

const ROW_DEFINITIONS: Array<RowDefinition> = [
  {
    label: 'Reports you own',
    value: (entitlements) => formatLimit(entitlements.maxReports),
  },
  {
    label: 'Transactions per report',
    value: () => 'Unlimited',
  },
  {
    label: 'Active subscriptions',
    value: (entitlements) => formatLimit(entitlements.maxSubscriptions),
  },
  {
    label: 'Contracts',
    value: (entitlements) => formatLimit(entitlements.maxContracts),
  },
  {
    label: 'Net worth snapshots',
    value: (entitlements) => formatLimit(entitlements.maxNetWorthSnapshots),
  },
  {
    label: 'Category trends history',
    value: (entitlements) => `${entitlements.maxTrendMonths} months`,
  },
  {
    label: 'CSV export',
    value: (entitlements) => formatCapability(entitlements.canExportCsv),
  },
  {
    label: 'Sharing reports you own',
    value: (entitlements) => formatCapability(entitlements.canShareReports),
  },
  {
    label: 'Reports shared with you',
    value: () => 'Included',
  },
];

export function buildPlanComparison(
  plans: Array<PlanOption>
): Array<PlanComparisonRow> {
  const free = plans.find((option) => option.plan === 'FREE');
  const pro = plans.find((option) => option.plan === 'PRO');

  if (!free || !pro) {
    return [];
  }

  return ROW_DEFINITIONS.map((definition) => ({
    free: definition.value(free.entitlements),
    label: definition.label,
    pro: definition.value(pro.entitlements),
  }));
}
