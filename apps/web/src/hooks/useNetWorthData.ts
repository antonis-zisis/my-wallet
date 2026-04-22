import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { SnapshotFormValues } from '../components/netWorth/NetWorthSnapshotModal';
import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
  UPDATE_NET_WORTH_SNAPSHOT,
} from '../graphql/netWorth';
import { NetWorthSnapshot, NetWorthSnapshotsData } from '../types/netWorth';

export const PAGE_SIZE = 10;

export type SnapshotModalState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'duplicate'; source: NetWorthSnapshot }
  | { kind: 'edit'; snapshot: NetWorthSnapshot };

export function useNetWorthData() {
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState<SnapshotModalState>({
    kind: 'closed',
  });
  const [snapshotToDelete, setSnapshotToDelete] =
    useState<NetWorthSnapshot | null>(null);

  const { data, error, loading } = useQuery<NetWorthSnapshotsData>(
    GET_NET_WORTH_SNAPSHOTS,
    { variables: { page, pageSize: PAGE_SIZE } }
  );

  const [createSnapshot] = useMutation(CREATE_NET_WORTH_SNAPSHOT, {
    refetchQueries: [
      {
        query: GET_NET_WORTH_SNAPSHOTS,
        variables: { page: 1, pageSize: PAGE_SIZE },
      },
    ],
  });

  const [updateSnapshot, { loading: isUpdating }] = useMutation(
    UPDATE_NET_WORTH_SNAPSHOT
  );

  const [deleteSnapshot, { loading: isDeleting }] = useMutation(
    DELETE_NET_WORTH_SNAPSHOT,
    {
      refetchQueries: [
        {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page, pageSize: PAGE_SIZE },
        },
      ],
    }
  );

  const snapshots = data?.netWorthSnapshots.items ?? [];
  const totalCount = data?.netWorthSnapshots.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCloseModal = () => setModalState({ kind: 'closed' });

  const handleCreate = async (input: SnapshotFormValues) => {
    await createSnapshot({ variables: { input } });
    setPage(1);
    handleCloseModal();
  };

  const handleUpdate = async (id: string, input: SnapshotFormValues) => {
    await updateSnapshot({
      variables: { id, input },
      refetchQueries: [
        {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page, pageSize: PAGE_SIZE },
        },
        { query: GET_NET_WORTH_SNAPSHOT, variables: { id } },
      ],
    });
    handleCloseModal();
  };

  const handleModalSubmit = async (input: SnapshotFormValues) => {
    if (modalState.kind === 'edit') {
      await handleUpdate(modalState.snapshot.id, input);
      return;
    }
    await handleCreate(input);
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
    isDeleting,
    isUpdating,
    loading,
    modalState,
    onCloseModal: handleCloseModal,
    onDeleteConfirm: handleDeleteConfirm,
    onModalSubmit: handleModalSubmit,
    onOpenCreate: () => setModalState({ kind: 'create' }),
    onOpenDuplicate: (source: NetWorthSnapshot) =>
      setModalState({ kind: 'duplicate', source }),
    onOpenEdit: (snapshot: NetWorthSnapshot) =>
      setModalState({ kind: 'edit', snapshot }),
    onPageChange: setPage,
    onSelectForDelete: setSnapshotToDelete,
    page,
    snapshotToDelete,
    snapshots,
    totalCount,
    totalPages,
  };
}
