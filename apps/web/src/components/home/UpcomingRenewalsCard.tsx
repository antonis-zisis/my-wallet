import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BillingCycle, Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { ChevronDownIcon } from '../icons';
import { Badge, Card, Skeleton } from '../ui';

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

  return 'text-gray-400 dark:text-gray-500';
}

function billingCycleLabel(billingCycle: BillingCycle): string {
  return billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly';
}

function billingCycleVariant(billingCycle: BillingCycle): 'success' | 'info' {
  return billingCycle === 'MONTHLY' ? 'success' : 'info';
}

export function UpcomingRenewalsCard({
  loading = false,
  subscriptions,
}: UpcomingRenewalsCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage(
    'home.upcomingRenewals.isOpen',
    true
  );

  if (loading) {
    return (
      <Card className="mt-4">
        <Skeleton className="mb-4 h-5 w-1/3" />
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3.5 w-12" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const sorted = [...subscriptions].sort((aa, bb) => {
    const dateA = getNextRenewalDate(aa.startDate, aa.billingCycle);
    const dateB = getNextRenewalDate(bb.startDate, bb.billingCycle);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="mt-4">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Renewals
        </h2>

        <ChevronDownIcon
          className={`ml-auto h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.slice(0, 5).map((subscription) => {
              const renewalDate = getNextRenewalDate(
                subscription.startDate,
                subscription.billingCycle
              );
              const daysUntil = getDaysUntil(renewalDate);
              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {subscription.name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(renewalDate)}
                      </p>

                      <span
                        className={`text-xs font-medium ${getUrgencyColor(daysUntil)}`}
                      >
                        · {formatUrgencyLabel(daysUntil)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-16 text-left">
                      <Badge
                        variant={billingCycleVariant(subscription.billingCycle)}
                      >
                        {billingCycleLabel(subscription.billingCycle)}
                      </Badge>
                    </div>

                    <p className="w-20 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {formatMoney(subscription.amount)} €
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
