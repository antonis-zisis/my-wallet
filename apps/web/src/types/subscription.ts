export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
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
