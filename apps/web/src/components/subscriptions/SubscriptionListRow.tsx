import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { BILLING_CYCLE_LABELS, Subscription } from '../../types/subscription';
import { getDaysUntil } from '../../utils/getDaysUntil';
import { isSafeUrl } from '../../utils/isSafeUrl';
import {
  FALLBACK_CATEGORY_COLOR,
  SUBSCRIPTION_CATEGORY_COLORS,
} from '../charts/categoryColors';
import { Badge, Dropdown, MoneyAmount } from '../ui';
import { DropdownItem } from '../ui/Dropdown';
import { SubscriptionAvatar } from './SubscriptionAvatar';
import { SubscriptionListRowMeta } from './SubscriptionListRowMeta';

type SubscriptionListRowProps = {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onResume?: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
};

function CategoryBadge({ category }: { category: string }) {
  const categoryColor =
    SUBSCRIPTION_CATEGORY_COLORS[category] ?? FALLBACK_CATEGORY_COLOR;

  return (
    <Badge
      size="sm"
      style={{ backgroundColor: `${categoryColor}1f`, color: categoryColor }}
    >
      {category}
    </Badge>
  );
}

function AmountCell({ subscription }: { subscription: Subscription }) {
  const showMonthlyEquivalent = subscription.billingCycle !== 'MONTHLY';

  return (
    <div className="shrink-0 text-right">
      <p className="text-text-primary text-sm font-semibold">
        <MoneyAmount amount={subscription.amount} />
      </p>
      {showMonthlyEquivalent && (
        <p className="text-text-tertiary mt-0.5 text-xs">
          ≈ <MoneyAmount amount={subscription.monthlyCost} /> / mo
        </p>
      )}
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
  const isMobile = useIsMobileViewport();
  const dropdownItems = buildDropdownItems(props);

  const name =
    subscription.url && isSafeUrl(subscription.url) ? (
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
    );

  const badges = (
    <>
      <Badge variant="default" size="sm">
        {BILLING_CYCLE_LABELS[subscription.billingCycle]}
      </Badge>

      {subscription.category && (
        <CategoryBadge category={subscription.category} />
      )}

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
    </>
  );

  return (
    <li className="flex items-center gap-1 sm:gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3 px-1 py-3 sm:items-center">
        <SubscriptionAvatar subscription={subscription} />

        <div className="min-w-0 flex-1">
          {isMobile ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                {name}
                <AmountCell subscription={subscription} />
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {badges}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {name}
              {badges}
            </div>
          )}

          <SubscriptionListRowMeta subscription={subscription} />
        </div>

        {!isMobile && <AmountCell subscription={subscription} />}
      </div>

      <Dropdown className="relative shrink-0" items={dropdownItems} />
    </li>
  );
}
