import { useState } from 'react';

import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { Card } from '../ui';

export function UpcomingRenewalsCard({
  subscriptions,
}: {
  subscriptions: Array<Subscription>;
}) {
  const [isOpen, setIsOpen] = useState(true);

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
