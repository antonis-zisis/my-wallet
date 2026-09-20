export const BILLING_INTERVALS = ['MONTH', 'YEAR'] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export type PlanStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

export type PlanPrice = {
  amount: number;
  currency: string;
  interval: BillingInterval;
};

export const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  MONTH: 'Monthly',
  YEAR: 'Yearly',
};

export const BILLING_PERIOD_LABELS: Record<BillingInterval, string> = {
  MONTH: 'month',
  YEAR: 'year',
};
