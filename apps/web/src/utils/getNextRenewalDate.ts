import { BillingCycle } from '../types/subscription';

export function getNextRenewalDate(
  startDate: Date | string | number,
  billingCycle: BillingCycle
): Date {
  const value =
    typeof startDate === 'string' && /^\d+$/.test(startDate)
      ? Number(startDate)
      : startDate;
  const parsed = value instanceof Date ? value : new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const increment = billingCycle === 'MONTHLY' ? 1 : 12;
  const next = new Date(parsed);

  while (next <= today) {
    next.setMonth(next.getMonth() + increment);
  }

  return next;
}
