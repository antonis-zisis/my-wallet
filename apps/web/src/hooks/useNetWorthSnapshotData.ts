import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { SnapshotFormValues } from '../components/netWorth/NetWorthSnapshotModal';
import {
  GET_NET_WORTH_SNAPSHOT,
  UPDATE_NET_WORTH_SNAPSHOT,
} from '../graphql/netWorth';
import { NetWorthSnapshot } from '../types/netWorth';

interface SnapshotData {
  netWorthSnapshot: NetWorthSnapshot | null;
}

export function useNetWorthSnapshotData() {
  const { id } = useParams<{ id: string }>();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data, error, loading } = useQuery<SnapshotData>(
    GET_NET_WORTH_SNAPSHOT,
    { variables: { id } }
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
    assets,
    error: !!error,
    isEditOpen,
    isPositive,
    isUpdating,
    liabilities,
    loading,
    onCloseEdit: () => setIsEditOpen(false),
    onEditSubmit: handleEditSubmit,
    onOpenEdit: () => setIsEditOpen(true),
    snapshot,
  };
}
