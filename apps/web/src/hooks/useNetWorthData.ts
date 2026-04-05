import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
} from '../graphql/netWorth';
import { NetWorthSnapshot, NetWorthSnapshotsData } from '../types/netWorth';

export const PAGE_SIZE = 10;

export function useNetWorthData() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] =
    useState<NetWorthSnapshot | null>(null);

  const { data, error, loading } = useQuery<NetWorthSnapshotsData>(
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

  const snapshots = data?.netWorthSnapshots.items ?? [];
  const totalCount = data?.netWorthSnapshots.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreate = async (input: {
    title: string;
    entries: Array<{
      type: string;
      label: string;
      amount: number;
      category: string;
    }>;
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

  return {
    error: !!error,
    isCreateOpen,
    isDeleting,
    loading,
    onCloseCreate: () => setIsCreateOpen(false),
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onOpenCreate: () => setIsCreateOpen(true),
    onPageChange: setPage,
    onSelectForDelete: setSnapshotToDelete,
    page,
    snapshotToDelete,
    snapshots,
    totalCount,
    totalPages,
  };
}
