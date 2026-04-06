import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { Card, Skeleton } from '../ui';

interface UpcomingRenewalsCardProps {
  loading?: boolean;
  subscriptions: Array<Subscription>;
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
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center gap-3"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upcoming Renewals
          </h2>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer"
        >
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
          {sorted.slice(0, 5).map((sub) => {
            const renewalDate = getNextRenewalDate(
              sub.startDate,
              sub.billingCycle
            );
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {sub.name}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(renewalDate)}
                  </p>
                </div>

                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatMoney(sub.amount)} €
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
