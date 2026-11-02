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

  const startDay = new Date(parsed);

  startDay.setHours(0, 0, 0, 0);

  const startsToday = startDay.getTime() === today.getTime();
  const earliestRenewal = new Date(today);

  if (startsToday) {
    earliestRenewal.setDate(today.getDate() + 1);
  }

  const next = new Date(parsed);

  if (billingCycle === 'WEEKLY') {
    while (next < earliestRenewal) {
      next.setDate(next.getDate() + 7);
    }
  } else {
    const increment =
      billingCycle === 'BIENNIAL'
        ? 24
        : billingCycle === 'YEARLY'
          ? 12
          : billingCycle === 'BI_ANNUAL'
            ? 6
            : billingCycle === 'QUARTERLY'
              ? 3
              : 1;
    while (next < earliestRenewal) {
      next.setMonth(next.getMonth() + increment);
    }
  }

  return next;
}
