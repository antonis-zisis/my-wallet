import { Subscription } from '../../../types/subscription';
import { isActiveTrial } from '../../../utils/isActiveTrial';

export type MostExpensive = {
  monthlyCost: number;
  name: string;
};

export function computeMostExpensive(
  subscriptions: Array<Subscription>
): MostExpensive | null {
  return subscriptions
    .filter(
      (subscription) =>
        !subscription.cancelledAt && !isActiveTrial(subscription)
    )
    .reduce<MostExpensive | null>(
      (best, subscription) =>
        !best || subscription.monthlyCost > best.monthlyCost
          ? { monthlyCost: subscription.monthlyCost, name: subscription.name }
          : best,
      null
    );
}
