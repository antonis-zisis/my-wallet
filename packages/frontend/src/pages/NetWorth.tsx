import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import {
  CreateNetWorthSnapshotModal,
  DeleteNetWorthSnapshotModal,
  NetWorthList,
} from '../components/netWorth';
import { Button, Pagination } from '../components/ui';
import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
} from '../graphql/netWorth';
import { NetWorthSnapshot, NetWorthSnapshotsData } from '../types/netWorth';

const PAGE_SIZE = 20;

export function NetWorth() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useQuery<NetWorthSnapshotsData>(
    GET_NET_WORTH_SNAPSHOTS,
    { variables: { page } }
  );

  const [createSnapshot] = useMutation(CREATE_NET_WORTH_SNAPSHOT, {
    refetchQueries: [
      { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
    ],
  });

  const [deleteSnapshot, { loading: isDeleting }] = useMutation(
    DELETE_NET_WORTH_SNAPSHOT,
    {
      refetchQueries: [{ query: GET_NET_WORTH_SNAPSHOTS, variables: { page } }],
    }
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] =
    useState<NetWorthSnapshot | null>(null);

  const snapshots = data?.netWorthSnapshots.items ?? [];
  const totalCount = data?.netWorthSnapshots.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreate = async (input: {
    title: string;
    entries: {
      type: string;
      label: string;
      amount: number;
      category: string;
    }[];
  }) => {
    await createSnapshot({ variables: { input } });
    setPage(1);
    setIsCreateOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!snapshotToDelete) {
      return;
    }
    await deleteSnapshot({ variables: { id: snapshotToDelete.id } });
    setSnapshotToDelete(null);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-end">
          <Button onClick={() => setIsCreateOpen(true)}>New Snapshot</Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <NetWorthList
            snapshots={snapshots}
            loading={loading}
            error={!!error}
            onDelete={setSnapshotToDelete}
          />
        </div>

        {!loading && !error && totalCount > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            itemCount={snapshots.length}
            onPageChange={setPage}
          />
        )}
      </div>

      <CreateNetWorthSnapshotModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <DeleteNetWorthSnapshotModal
        isOpen={!!snapshotToDelete}
        onClose={() => setSnapshotToDelete(null)}
        onConfirm={handleDeleteConfirm}
        snapshotTitle={snapshotToDelete?.title ?? ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
