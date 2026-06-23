export type SubscriptionSortField = 'NAME' | 'MONTHLY_COST' | 'NEXT_RENEWAL';

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

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Utilities',
  'Health',
  'Finance',
  'Education',
  'Music',
  'News',
  'Other',
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const SUBSCRIPTION_CATEGORY_OPTIONS: Array<{
  label: string;
  value: SubscriptionCategory | '';
}> = [
  { label: 'Uncategorized', value: '' },
  ...SUBSCRIPTION_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
];

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  cancelledAt: string | null;
  trialEndsAt: string | null;
  category: SubscriptionCategory | null;
  notes: string | null;
  paymentMethod: string | null;
  url: string | null;
  monthlyCost: number;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionsData = {
  subscriptions: {
    items: Array<Subscription>;
    totalCount: number;
  };
};
