import {
  NetWorthBackLink,
  NetWorthEntriesSection,
  NetWorthSnapshotHeader,
  NetWorthSnapshotSkeleton,
} from '../components/netWorth';
import { PageLayout } from '../components/ui';
import { useNetWorthSnapshotData } from '../hooks/useNetWorthSnapshotData';

export function NetWorthSnapshotPage() {
  const { assets, error, isPositive, liabilities, loading, snapshot } =
    useNetWorthSnapshotData();

  if (loading) {
    return <NetWorthSnapshotSkeleton />;
  }

  if (error || !snapshot) {
    return (
      <PageLayout>
        <NetWorthBackLink />

        <p className="text-center text-red-500">
          {error ? 'Failed to load snapshot.' : 'Snapshot not found.'}
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="space-y-4">
      <NetWorthBackLink />

      <NetWorthSnapshotHeader
        createdAt={snapshot.createdAt}
        isPositive={isPositive}
        netWorth={snapshot.netWorth}
        title={snapshot.title}
        totalAssets={snapshot.totalAssets}
        totalLiabilities={snapshot.totalLiabilities}
      />

      <NetWorthEntriesSection
        colorClass="text-green-600 dark:text-green-400"
        entries={assets}
        title="Assets"
        total={snapshot.totalAssets}
      />

      <NetWorthEntriesSection
        colorClass="text-red-600 dark:text-red-400"
        entries={liabilities}
        title="Liabilities"
        total={snapshot.totalLiabilities}
      />
    </PageLayout>
  );
}
