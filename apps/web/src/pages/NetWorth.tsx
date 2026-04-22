import { DeleteNetWorthSnapshotModal } from '../components/netWorth/DeleteNetWorthSnapshotModal';
import { NetWorthList } from '../components/netWorth/NetWorthList';
import {
  EntryInput,
  NetWorthSnapshotModal,
} from '../components/netWorth/NetWorthSnapshotModal';
import { Button, PageLayout, Pagination } from '../components/ui';
import { PAGE_SIZE, useNetWorthData } from '../hooks/useNetWorthData';
import { NetWorthEntry, NetWorthSnapshot } from '../types/netWorth';

function toEntryInputs(snapshot: NetWorthSnapshot): Array<EntryInput> {
  return snapshot.entries.map((entry: NetWorthEntry) => ({
    type: entry.type,
    category: entry.category,
    label: entry.label,
    amount: entry.amount,
  }));
}

function getModalConfig(
  modalState: ReturnType<typeof useNetWorthData>['modalState']
): {
  initialEntries?: Array<EntryInput>;
  initialTitle?: string;
  modalTitle: string;
  submitLabel: string;
} {
  if (modalState.kind === 'edit') {
    return {
      initialEntries: toEntryInputs(modalState.snapshot),
      initialTitle: modalState.snapshot.title,
      modalTitle: 'Edit Net Worth Snapshot',
      submitLabel: 'Update Snapshot',
    };
  }

  if (modalState.kind === 'duplicate') {
    return {
      initialEntries: toEntryInputs(modalState.source),
      modalTitle: 'Duplicate Net Worth Snapshot',
      submitLabel: 'Save Snapshot',
    };
  }

  return {
    modalTitle: 'New Net Worth Snapshot',
    submitLabel: 'Save Snapshot',
  };
}

export function NetWorth() {
  const {
    error,
    isDeleting,
    loading,
    modalState,
    onCloseModal,
    onDeleteConfirm,
    onModalSubmit,
    onOpenCreate,
    onOpenDuplicate,
    onOpenEdit,
    onPageChange,
    onSelectForDelete,
    page,
    snapshotToDelete,
    snapshots,
    totalCount,
    totalPages,
  } = useNetWorthData();

  const modalConfig = getModalConfig(modalState);

  return (
    <>
      <PageLayout>
        <div className="mb-4 flex items-center justify-end">
          <Button onClick={onOpenCreate}>New Snapshot</Button>
        </div>

        <NetWorthList
          error={error}
          loading={loading}
          snapshots={snapshots}
          onDelete={onSelectForDelete}
          onDuplicate={onOpenDuplicate}
          onEdit={onOpenEdit}
        />

        {!loading && !error && totalCount > 0 && (
          <Pagination
            itemCount={snapshots.length}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </PageLayout>

      <NetWorthSnapshotModal
        initialEntries={modalConfig.initialEntries}
        initialTitle={modalConfig.initialTitle}
        isOpen={modalState.kind !== 'closed'}
        modalTitle={modalConfig.modalTitle}
        submitLabel={modalConfig.submitLabel}
        onClose={onCloseModal}
        onSubmit={onModalSubmit}
      />

      <DeleteNetWorthSnapshotModal
        isDeleting={isDeleting}
        isOpen={!!snapshotToDelete}
        snapshotTitle={snapshotToDelete?.title ?? ''}
        onClose={() => onSelectForDelete(null)}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
