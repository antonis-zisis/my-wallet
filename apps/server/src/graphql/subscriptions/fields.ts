import { computeMonthlyCost } from './lib/computeMonthlyCost';

type SubscriptionParent = {
  amount: number;
  billingCycle: string;
  isActive: boolean;
  cancelledAt: Date | null;
  endDate: Date | null;
};

export const subscriptionFieldResolvers = {
  monthlyCost: (parent: SubscriptionParent) => computeMonthlyCost(parent),
  isActive: (parent: SubscriptionParent) => {
    if (parent.cancelledAt) {
      return parent.endDate ? parent.endDate > new Date() : false;
    }

    return parent.isActive;
  },
};
