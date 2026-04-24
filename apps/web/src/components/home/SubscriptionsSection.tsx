import { Subscription } from '../../types/subscription';
import { SubscriptionsCTACard } from './SubscriptionsCTACard';
import { SubscriptionsSkeletonGrid } from './SubscriptionsSkeletonGrid';
import { SubscriptionSummarySection } from './SubscriptionSummarySection';
import { UpcomingRenewalsCard } from './UpcomingRenewalsCard';

function isActiveTrial(subscription: Subscription): boolean {
  if (!subscription.trialEndsAt) {
    return false;
  }
  const value = /^\d+$/.test(subscription.trialEndsAt)
    ? Number(subscription.trialEndsAt)
    : subscription.trialEndsAt;
  return new Date(value) > new Date();
}

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

  const paidSubscriptions = subscriptions.filter(
    (subscription) => !isActiveTrial(subscription)
  );

  return (
    <>
      <SubscriptionSummarySection
        currentIncome={currentIncome}
        subscriptions={subscriptions}
      />
      <UpcomingRenewalsCard subscriptions={paidSubscriptions} />
    </>
  );
}
