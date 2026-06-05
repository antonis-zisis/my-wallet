type MonthlyCostInput = {
  amount: number;
  billingCycle: string;
};

export function computeMonthlyCost(subscription: MonthlyCostInput): number {
  switch (subscription.billingCycle) {
    case 'WEEKLY':
      return subscription.amount * (52 / 12);
    case 'QUARTERLY':
      return subscription.amount / 3;
    case 'BI_ANNUAL':
      return subscription.amount / 6;
    case 'YEARLY':
      return subscription.amount / 12;
    default:
      return subscription.amount;
  }
}
