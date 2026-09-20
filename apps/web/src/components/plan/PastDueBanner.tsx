import { Link } from 'react-router';

import { useBillingStatus } from '../../hooks/billing/useBillingStatus';

export function PastDueBanner() {
  const { isPastDue } = useBillingStatus();

  if (!isPastDue) {
    return null;
  }

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
      We could not take your last Pro payment. Pro stays on while you sort it
      out —{' '}
      <Link to="/profile" className="font-semibold underline">
        update your payment method
      </Link>
      .
    </div>
  );
}
