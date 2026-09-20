import { Link } from 'react-router';

import { Button, Card, Spinner } from '../ui';

type CheckoutStatusPanelProps = {
  onRefresh: () => void;
  state: 'FINALIZING' | 'TIMED_OUT' | 'UPGRADED';
};

export function CheckoutStatusPanel({
  onRefresh,
  state,
}: CheckoutStatusPanelProps) {
  if (state === 'FINALIZING') {
    return (
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Spinner className="text-text-tertiary h-6 w-6" />

        <p className="text-text-primary text-sm font-medium">
          Finishing up your upgrade…
        </p>

        <p className="text-text-secondary text-sm">
          Your payment went through. We are waiting for Stripe to confirm it.
        </p>
      </Card>
    );
  }

  if (state === 'TIMED_OUT') {
    return (
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-text-primary text-sm font-medium">
          Your payment went through
        </p>

        <p className="text-text-secondary text-sm">
          Pro is taking a moment to switch on. Nothing is lost — check again in
          a few seconds.
        </p>

        <Button variant="secondary" onClick={onRefresh}>
          Check again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-text-primary text-base font-semibold">
        You are on Pro
      </p>

      <p className="text-text-secondary text-sm">
        Every limit is lifted. Reports, subscriptions, contracts and snapshots
        are all unlimited now.
      </p>

      <Link
        to="/"
        className="bg-brand-500 hover:bg-brand-600 inline-flex items-center rounded px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        Go to the dashboard
      </Link>
    </Card>
  );
}
