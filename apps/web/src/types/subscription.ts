import { SortOrder } from './sort';

export type SubscriptionSortField = 'NAME' | 'MONTHLY_COST' | 'NEXT_RENEWAL';

export type SubscriptionSortOption =
  | 'NAME'
  | 'COST_HIGH_LOW'
  | 'COST_LOW_HIGH'
  | 'NEXT_RENEWAL';

export const SUBSCRIPTION_SORT_CONFIG: Record<
  SubscriptionSortOption,
  { sortBy: SubscriptionSortField; sortOrder: SortOrder }
> = {
  NAME: { sortBy: 'NAME', sortOrder: 'ASC' },
  COST_HIGH_LOW: { sortBy: 'MONTHLY_COST', sortOrder: 'DESC' },
  COST_LOW_HIGH: { sortBy: 'MONTHLY_COST', sortOrder: 'ASC' },
  NEXT_RENEWAL: { sortBy: 'NEXT_RENEWAL', sortOrder: 'ASC' },
};

export const SUBSCRIPTION_SORT_OPTIONS: Array<{
  value: SubscriptionSortOption;
  label: string;
}> = [
  { value: 'NAME', label: 'Name (A–Z)' },
  { value: 'COST_HIGH_LOW', label: 'Cost (High–Low)' },
  { value: 'COST_LOW_HIGH', label: 'Cost (Low–High)' },
  { value: 'NEXT_RENEWAL', label: 'Next Renewal' },
];

export type BillingCycle =
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'BI_ANNUAL'
  | 'YEARLY';

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BI_ANNUAL: 'Bi-annual',
  YEARLY: 'Yearly',
};

export const BILLING_CYCLE_OPTIONS: Array<{
  label: string;
  value: BillingCycle;
}> = (Object.keys(BILLING_CYCLE_LABELS) as Array<BillingCycle>).map(
  (value) => ({
    label: BILLING_CYCLE_LABELS[value],
    value,
  })
);

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
