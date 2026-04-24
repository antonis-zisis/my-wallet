export type BillingCycle =
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'BI_ANNUAL'
  | 'YEARLY';

export const BILLING_CYCLE_OPTIONS: Array<{
  label: string;
  value: BillingCycle;
}> = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Bi-annual', value: 'BI_ANNUAL' },
  { label: 'Yearly', value: 'YEARLY' },
];

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  cancelledAt: string | null;
  trialEndsAt: string | null;
  notes: string | null;
  paymentMethod: string | null;
  url: string | null;
  monthlyCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsData {
  subscriptions: {
    items: Array<Subscription>;
    totalCount: number;
  };
}
