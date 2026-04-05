import { Subscription } from '../../types/subscription';
import { SubscriptionsCTACard } from './SubscriptionsCTACard';
import { SubscriptionsSkeletonGrid } from './SubscriptionsSkeletonGrid';
import { SubscriptionSummarySection } from './SubscriptionSummarySection';
import { UpcomingRenewalsCard } from './UpcomingRenewalsCard';

export function SubscriptionsSection({
  currentIncome,
  loading,
  subscriptions,
}: {
  currentIncome: number;
  loading: boolean;
  subscriptions: Array<Subscription>;
}) {
  if (loading) {
    return (
      <>
        <SubscriptionsSkeletonGrid />
        <UpcomingRenewalsCard loading subscriptions={[]} />
      </>
    );
  }

  if (subscriptions.length === 0) {
    return <SubscriptionsCTACard />;
  }

  return (
    <>
      <SubscriptionSummarySection
        currentIncome={currentIncome}
        subscriptions={subscriptions}
      />
      <UpcomingRenewalsCard subscriptions={subscriptions} />
    </>
  );
}
