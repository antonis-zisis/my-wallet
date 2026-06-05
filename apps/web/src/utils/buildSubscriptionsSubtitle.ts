import { getDaysUntil } from './getDaysUntil';

export function buildSubscriptionsSubtitle(
  activeTotalCount: number,
  nextRenewalDate: Date | null
): string {
  if (activeTotalCount === 0) {
    return 'Track recurring payments in one place.';
  }

  const subscriptionWord =
    activeTotalCount === 1 ? 'subscription' : 'subscriptions';
  const activeLabel = `${activeTotalCount} active ${subscriptionWord}`;

  if (!nextRenewalDate) {
    return activeLabel;
  }

  const daysUntil = getDaysUntil(nextRenewalDate);

  if (daysUntil <= 0) {
    return `${activeLabel} · next renewal today`;
  }

  if (daysUntil === 1) {
    return `${activeLabel} · next renewal tomorrow`;
  }

  return `${activeLabel} · next renewal in ${daysUntil} days`;
}
