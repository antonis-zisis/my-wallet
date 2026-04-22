import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SnapshotFormValues } from '../components/netWorth/NetWorthSnapshotModal';
import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOT,
  UPDATE_NET_WORTH_SNAPSHOT,
} from '../graphql/netWorth';
import { EntryDelta, NetWorthEntry, NetWorthSnapshot } from '../types/netWorth';

interface SnapshotData {
  netWorthSnapshot: NetWorthSnapshot | null;
}

function buildEntryDeltas(
  entries: Array<NetWorthEntry>,
  previousEntryAmounts: Record<string, number>
): Record<string, EntryDelta> {
  const result: Record<string, EntryDelta> = {};

  for (const entry of entries) {
    const key = `${entry.category}:${entry.label}`;
    const lookupKey = `${entry.type}:${entry.category}:${entry.label}`;

    if (lookupKey in previousEntryAmounts) {
      result[key] = {
        delta: entry.amount - previousEntryAmounts[lookupKey],
        isNew: false,
      };
    } else {
      result[key] = { delta: 0, isNew: true };
    }
  }

  return result;
}

export function useNetWorthSnapshotData() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data, error, loading } = useQuery<SnapshotData>(
    GET_NET_WORTH_SNAPSHOT,
    { variables: { id } }
  );

  const [createSnapshot] = useMutation(CREATE_NET_WORTH_SNAPSHOT);

  const [deleteSnapshot, { loading: isDeleting }] = useMutation(
    DELETE_NET_WORTH_SNAPSHOT
  );

  const [updateSnapshot, { loading: isUpdating }] = useMutation(
    UPDATE_NET_WORTH_SNAPSHOT
  );

  const snapshot = data?.netWorthSnapshot ?? null;
  const assets =
    snapshot?.entries.filter((entry) => entry.type === 'ASSET') ?? [];
  const liabilities =
    snapshot?.entries.filter((entry) => entry.type === 'LIABILITY') ?? [];
  const isPositive = (snapshot?.netWorth ?? 0) >= 0;

  const previousSnapshot = snapshot?.previousSnapshot ?? null;

  const previousEntryAmounts: Record<string, number> = {};
  if (previousSnapshot) {
    for (const entry of previousSnapshot.entries ?? []) {
      const key = `${entry.type}:${entry.category}:${entry.label}`;
      previousEntryAmounts[key] = entry.amount;
    }
  }

  const assetDeltas = previousSnapshot
    ? buildEntryDeltas(assets, previousEntryAmounts)
    : undefined;

  const liabilityDeltas = previousSnapshot
    ? buildEntryDeltas(liabilities, previousEntryAmounts)
    : undefined;

  const deltaAssets = previousSnapshot
    ? (snapshot?.totalAssets ?? 0) - previousSnapshot.totalAssets
    : null;

  const deltaLiabilities = previousSnapshot
    ? (snapshot?.totalLiabilities ?? 0) - previousSnapshot.totalLiabilities
    : null;

  const deltaNetWorth = previousSnapshot
    ? (snapshot?.netWorth ?? 0) - previousSnapshot.netWorth
    : null;

  const handleDeleteConfirm = async () => {
    if (!snapshot) {
      return;
    }
    await deleteSnapshot({ variables: { id: snapshot.id } });
    navigate('/net-worth');
  };

  const handleDuplicateSubmit = async (input: SnapshotFormValues) => {
    await createSnapshot({ variables: { input } });
    navigate('/net-worth');
  };

  const handleEditSubmit = async (input: SnapshotFormValues) => {
    if (!snapshot) {
      return;
    }

    await updateSnapshot({
      variables: { id: snapshot.id, input },
      refetchQueries: [
        { query: GET_NET_WORTH_SNAPSHOT, variables: { id: snapshot.id } },
      ],
    });

    setIsEditOpen(false);
  };

  return {
    assetDeltas,
    assets,
    deltaAssets,
    deltaLiabilities,
    deltaNetWorth,
    error: !!error,
    isDeleteOpen,
    isDeleting,
    isDuplicateOpen,
    isEditOpen,
    isPositive,
    isUpdating,
    liabilities,
    liabilityDeltas,
    loading,
    onCloseDelete: () => setIsDeleteOpen(false),
    onCloseDuplicate: () => setIsDuplicateOpen(false),
    onCloseEdit: () => setIsEditOpen(false),
    onDeleteConfirm: handleDeleteConfirm,
    onDuplicateSubmit: handleDuplicateSubmit,
    onEditSubmit: handleEditSubmit,
    onOpenDelete: () => setIsDeleteOpen(true),
    onOpenDuplicate: () => setIsDuplicateOpen(true),
    onOpenEdit: () => setIsEditOpen(true),
    snapshot,
  };
}
