import { NetWorthBackLink } from '../components/netWorth/NetWorthBackLink';
import { NetWorthEntriesSection } from '../components/netWorth/NetWorthEntriesSection';
import { NetWorthSnapshotHeader } from '../components/netWorth/NetWorthSnapshotHeader';
import {
  EntryInput,
  NetWorthSnapshotModal,
} from '../components/netWorth/NetWorthSnapshotModal';
import { NetWorthSnapshotSkeleton } from '../components/netWorth/NetWorthSnapshotSkeleton';
import { PageLayout } from '../components/ui';
import { useNetWorthSnapshotData } from '../hooks/useNetWorthSnapshotData';

export function NetWorthSnapshotPage() {
  const {
    assetDeltas,
    assets,
    deltaAssets,
    deltaLiabilities,
    deltaNetWorth,
    error,
    isEditOpen,
    isPositive,
    liabilities,
    liabilityDeltas,
    loading,
    onCloseEdit,
    onEditSubmit,
    onOpenEdit,
    snapshot,
  } = useNetWorthSnapshotData();

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

  const initialEntries: Array<EntryInput> = snapshot.entries.map((entry) => ({
    type: entry.type,
    category: entry.category,
    label: entry.label,
    amount: entry.amount,
  }));

  return (
    <>
      <PageLayout className="space-y-4">
        <NetWorthBackLink />

        <NetWorthSnapshotHeader
          createdAt={snapshot.createdAt}
          deltaAssets={deltaAssets}
          deltaLiabilities={deltaLiabilities}
          deltaNetWorth={deltaNetWorth}
          isPositive={isPositive}
          netWorth={snapshot.netWorth}
          title={snapshot.title}
          totalAssets={snapshot.totalAssets}
          totalLiabilities={snapshot.totalLiabilities}
          onEdit={onOpenEdit}
        />

        <NetWorthEntriesSection
          colorClass="text-green-600 dark:text-green-400"
          entries={assets}
          entryDeltas={assetDeltas}
          title="Assets"
          total={snapshot.totalAssets}
        />

        <NetWorthEntriesSection
          colorClass="text-red-600 dark:text-red-400"
          entries={liabilities}
          entryDeltas={liabilityDeltas}
          title="Liabilities"
          total={snapshot.totalLiabilities}
        />
      </PageLayout>

      <NetWorthSnapshotModal
        initialEntries={initialEntries}
        initialTitle={snapshot.title}
        isOpen={isEditOpen}
        modalTitle="Edit Net Worth Snapshot"
        submitLabel="Update Snapshot"
        onClose={onCloseEdit}
        onSubmit={onEditSubmit}
      />
    </>
  );
}
