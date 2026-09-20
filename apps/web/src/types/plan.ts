export const PLANS = ['FREE', 'PRO'] as const;

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

export type PlanLimitKey = {
  [Key in keyof PlanEntitlements]: null extends PlanEntitlements[Key]
    ? Key
    : never;
}[keyof PlanEntitlements];

export type PlanUsage = {
  activeSubscriptions: number;
  contracts: number;
  netWorthSnapshots: number;
  reports: number;
};

export const PLAN_USAGE_KEYS: Record<PlanLimitKey, keyof PlanUsage> = {
  maxContracts: 'contracts',
  maxNetWorthSnapshots: 'netWorthSnapshots',
  maxReports: 'reports',
  maxSubscriptions: 'activeSubscriptions',
};

export type PlanOption = {
  entitlements: PlanEntitlements;
  plan: Plan;
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: 'Free',
  PRO: 'Pro',
};

export const PLAN_TAGLINES: Record<Plan, string> = {
  FREE: 'The budgeting basics, for one person.',
  PRO: 'The whole wallet, unlimited and shared.',
};

export type PlanCapabilityKey = {
  [Key in keyof PlanEntitlements]: PlanEntitlements[Key] extends boolean
    ? Key
    : never;
}[keyof PlanEntitlements];

export const PLAN_LIMIT_LABELS: Record<PlanLimitKey, string> = {
  maxContracts: 'contracts',
  maxNetWorthSnapshots: 'net worth snapshots',
  maxReports: 'reports',
  maxSubscriptions: 'active subscriptions',
};

export const PLAN_CAPABILITY_MESSAGES: Record<PlanCapabilityKey, string> = {
  canExportCsv: 'Exporting a report to CSV is part of Pro.',
  canShareReports: 'Sharing a report with other people is part of Pro.',
};
