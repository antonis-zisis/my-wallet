import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import {
  formatCancellationCountdown,
  formatTrialCountdown,
} from '../../utils/formatSubscriptionCountdown';
import { getDaysUntil } from '../../utils/getDaysUntil';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';

type SubscriptionListRowMetaProps = {
  subscription: Subscription;
};

function TertiaryLine({ subscription }: { subscription: Subscription }) {
  const parts: Array<string> = [];

  if (subscription.paymentMethod) {
    parts.push(`via ${subscription.paymentMethod}`);
  }

  if (subscription.notes) {
    parts.push(subscription.notes);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <p className="text-text-tertiary mt-0.5 truncate text-xs italic">
      {parts.join(' · ')}
    </p>
  );
}

function SecondaryLine({ subscription }: { subscription: Subscription }) {
  if (subscription.cancelledAt && subscription.endDate) {
    return (
      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
        {formatCancellationCountdown(subscription.endDate)}
      </p>
    );
  }

  if (subscription.trialEndsAt) {
    const daysLeft = getDaysUntil(subscription.trialEndsAt);

    if (daysLeft >= 0) {
      return (
        <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
          {formatTrialCountdown(subscription.trialEndsAt)}
        </p>
      );
    }
  }

  if (!subscription.isActive) {
    return null;
  }

  const renewalDate = getNextRenewalDate(
    subscription.startDate,
    subscription.billingCycle
  );
  const daysUntil = getDaysUntil(renewalDate);
  const relativeLabel =
    daysUntil === 0
      ? 'today'
      : daysUntil === 1
        ? 'tomorrow'
        : daysUntil < 30
          ? `in ${daysUntil}d`
          : null;

  return (
    <p className="text-text-secondary mt-0.5 text-xs">
      next renewal at{' '}
      <span className="font-semibold">{formatDate(renewalDate)}</span>
      {relativeLabel && ` · ${relativeLabel}`}
    </p>
  );
}

export function SubscriptionListRowMeta({
  subscription,
}: SubscriptionListRowMetaProps) {
  return (
    <>
      <SecondaryLine subscription={subscription} />
      <TertiaryLine subscription={subscription} />
    </>
  );
}
