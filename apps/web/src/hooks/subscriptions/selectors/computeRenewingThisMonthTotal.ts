import { Subscription } from '../../../types/subscription';
import { isActiveTrial } from '../../../utils/isActiveTrial';

function parseDate(value: string): Date {
  const coerced = /^\d+$/.test(value) ? Number(value) : value;

  return new Date(coerced);
}

export function computeRenewingThisMonthTotal(
  subscriptions: Array<Subscription>
): number {
  const now = new Date();
  const currentMonth = now.getMonth();

  return subscriptions
    .filter(
      (subscription) =>
        !subscription.cancelledAt && !isActiveTrial(subscription)
    )
    .reduce((total, subscription) => {
      const startDate = parseDate(subscription.startDate);
      const startMonth = startDate.getMonth();

      switch (subscription.billingCycle) {
        case 'WEEKLY': {
          const daysInMonth = new Date(
            now.getFullYear(),
            currentMonth + 1,
            0
          ).getDate();
          const firstDayOfMonth = new Date(
            now.getFullYear(),
            currentMonth,
            1
          ).getDay();
          const dayOfWeek = startDate.getDay();
          const weeklyCount =
            Math.floor(daysInMonth / 7) +
            ((dayOfWeek - firstDayOfMonth + 7) % 7 < daysInMonth % 7 ? 1 : 0);

          return total + subscription.amount * weeklyCount;
        }

        case 'MONTHLY':
          return total + subscription.amount;
        case 'QUARTERLY':
          return (currentMonth - startMonth) % 3 === 0
            ? total + subscription.amount
            : total;
        case 'BI_ANNUAL':
          return (currentMonth - startMonth) % 6 === 0
            ? total + subscription.amount
            : total;
        case 'YEARLY':
          return startMonth === currentMonth
            ? total + subscription.amount
            : total;
        default:
          return total;
      }
    }, 0);
}
