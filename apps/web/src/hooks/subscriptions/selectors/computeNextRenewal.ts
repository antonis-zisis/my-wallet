import { Subscription } from '../../../types/subscription';
import { getNextRenewalDate } from '../../../utils/getNextRenewalDate';
import { isActiveTrial } from '../../../utils/isActiveTrial';

export type NextRenewal = {
  amount: number;
  date: Date;
  name: string;
};

export function computeNextRenewal(
  subscriptions: Array<Subscription>
): NextRenewal | null {
  return (
    subscriptions
      .filter(
        (subscription) =>
          !subscription.cancelledAt && !isActiveTrial(subscription)
      )
      .map((subscription) => ({
        amount: subscription.amount,
        date: getNextRenewalDate(
          subscription.startDate,
          subscription.billingCycle
        ),
        name: subscription.name,
      }))
      .sort((left, right) => left.date.getTime() - right.date.getTime())[0] ??
    null
  );
}
