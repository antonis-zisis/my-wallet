import { usePrivacy } from '../../contexts/PrivacyContext';
import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoneyOrMask } from '../../utils/formatMoney';
import {
  formatCancellationCountdown,
  formatTrialCountdown,
} from '../../utils/formatSubscriptionCountdown';
import { getDaysUntil } from '../../utils/getDaysUntil';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { isSafeUrl } from '../../utils/isSafeUrl';
import { Badge, Dropdown, MoneyAmount } from '../ui';
import { DropdownItem } from '../ui/Dropdown';

interface SubscriptionListRowProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onResume?: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

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

function AmountCell({ subscription }: { subscription: Subscription }) {
  const { isAmountsHidden } = usePrivacy();
  const normalized =
    subscription.billingCycle === 'MONTHLY'
      ? `${formatMoneyOrMask(subscription.amount * 12, isAmountsHidden)} € / yr`
      : `${formatMoneyOrMask(subscription.monthlyCost, isAmountsHidden)} € / mo`;

  return (
    <div className="text-right">
      <p className="text-text-primary text-sm font-semibold">
        <MoneyAmount amount={subscription.amount} />
      </p>
      <p className="text-text-tertiary mt-0.5 text-xs">{normalized}</p>
    </div>
  );
}

function buildDropdownItems({
  onCancel,
  onDelete,
  onEdit,
  onResume,
  subscription,
}: SubscriptionListRowProps): Array<DropdownItem> {
  const items: Array<DropdownItem> = [];

  if (onEdit) {
    items.push({ label: 'Edit', onClick: () => onEdit(subscription) });
  }

  if (onCancel && !subscription.cancelledAt) {
    items.push({ label: 'Cancel', onClick: () => onCancel(subscription) });
  }

  if (onResume && (subscription.cancelledAt || !subscription.isActive)) {
    items.push({ label: 'Resume', onClick: () => onResume(subscription) });
  }

  items.push({
    label: 'Delete',
    onClick: () => onDelete(subscription),
    variant: 'danger',
  });

  return items;
}

export function SubscriptionListRow(props: SubscriptionListRowProps) {
  const { subscription } = props;
  const dropdownItems = buildDropdownItems(props);

  return (
    <li className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {subscription.url && isSafeUrl(subscription.url) ? (
              <a
                className="text-text-primary truncate font-medium hover:underline"
                href={subscription.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {subscription.name}
              </a>
            ) : (
              <span className="text-text-primary truncate font-medium">
                {subscription.name}
              </span>
            )}

            <Badge variant="default" size="sm">
              {subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
            </Badge>

            {subscription.trialEndsAt &&
              getDaysUntil(subscription.trialEndsAt) >= 0 && (
                <Badge variant="warning" size="sm">
                  Trial
                </Badge>
              )}

            {subscription.cancelledAt && (
              <Badge variant="danger" size="sm">
                Cancelled
              </Badge>
            )}
          </div>

          <SecondaryLine subscription={subscription} />
          <TertiaryLine subscription={subscription} />
        </div>

        <AmountCell subscription={subscription} />
      </div>

      <Dropdown items={dropdownItems} />
    </li>
  );
}
