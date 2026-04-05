import {
  CreateNetWorthSnapshotModal,
  DeleteNetWorthSnapshotModal,
  NetWorthList,
} from '../components/netWorth';
import { Button, PageLayout, Pagination } from '../components/ui';
import { PAGE_SIZE, useNetWorthData } from '../hooks/useNetWorthData';

export function NetWorth() {
  const {
    error,
    isCreateOpen,
    isDeleting,
    loading,
    onCloseCreate,
    onCreate,
    onDeleteConfirm,
    onOpenCreate,
    onPageChange,
    onSelectForDelete,
    page,
    snapshotToDelete,
    snapshots,
    totalCount,
    totalPages,
  } = useNetWorthData();

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

      <CreateNetWorthSnapshotModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSubmit={onCreate}
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
