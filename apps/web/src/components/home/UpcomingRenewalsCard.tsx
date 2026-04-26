import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BillingCycle, Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { ChevronDownIcon, InfoIcon } from '../icons';
import { Card, Skeleton, Tooltip } from '../ui';

interface UpcomingRenewalsCardProps {
  loading?: boolean;
  subscriptions: Array<Subscription>;
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatUrgencyLabel(days: number): string {
  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `in ${days}d`;
}

function getUrgencyColor(days: number): string {
  if (days <= 3) {
    return 'text-red-600 dark:text-red-400';
  }

  if (days <= 7) {
    return 'text-amber-600 dark:text-amber-400';
  }

  return 'text-text-tertiary';
}

function billingCycleLabel(billingCycle: BillingCycle): string {
  return billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly';
}

export function UpcomingRenewalsCard({
  loading = false,
  subscriptions,
}: UpcomingRenewalsCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage(
    'home.upcomingRenewals.isOpen',
    true
  );

  const sorted = loading
    ? []
    : [...subscriptions]
        .map((subscription) => ({
          subscription,
          renewalDate: getNextRenewalDate(
            subscription.startDate,
            subscription.billingCycle
          ),
        }))
        .filter(({ renewalDate }) => getDaysUntil(renewalDate) <= 40)
        .sort((aa, bb) => aa.renewalDate.getTime() - bb.renewalDate.getTime())
        .slice(0, 5);

  return (
    <Card className="mt-4">
      {loading ? (
        <div className="flex w-full items-center gap-2">
          <Skeleton className="h-7 w-44" />
          <ChevronDownIcon className="text-border ml-auto h-5 w-5" />
        </div>
      ) : (
        <button
          aria-expanded={isOpen}
          type="button"
          className="flex w-full cursor-pointer items-center gap-2"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h2 className="text-text-primary text-lg font-semibold">
            Upcoming Renewals
          </h2>

          <span onClick={(event) => event.stopPropagation()}>
            <Tooltip content="Shows up to 5 active subscriptions renewing within the next 40 days, sorted by nearest date.">
              <InfoIcon className="text-text-tertiary h-3.5 w-3.5 cursor-pointer" />
            </Tooltip>
          </span>

          <ChevronDownIcon
            className={`text-text-secondary ml-auto h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="divide-border mt-4 divide-y">
            {loading ? (
              [0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3.5 w-12" />
                </div>
              ))
            ) : sorted.length === 0 ? (
              <p className="text-text-secondary py-4 text-center text-sm">
                No renewals due in the next 40 days.
              </p>
            ) : (
              sorted.map(({ renewalDate, subscription }) => {
                const daysUntil = getDaysUntil(renewalDate);
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-text-primary text-sm font-medium">
                        {subscription.name}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-text-secondary text-xs">
                          {billingCycleLabel(subscription.billingCycle)}
                        </p>

                        <span className="text-text-secondary text-xs">·</span>

                        <p className="text-text-secondary text-xs">
                          {formatDate(renewalDate)}
                        </p>

                        <span className="text-text-secondary text-xs">·</span>

                        <span
                          className={`text-xs font-medium ${getUrgencyColor(daysUntil)}`}
                        >
                          {formatUrgencyLabel(daysUntil)}
                        </span>
                      </div>
                    </div>

                    <p className="text-text-primary text-sm font-semibold">
                      {formatMoney(subscription.amount)} €
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
