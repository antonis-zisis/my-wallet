import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';

import { GET_NET_WORTH_SNAPSHOT } from '../graphql/netWorth';
import { NetWorthSnapshot } from '../types/netWorth';

interface SnapshotData {
  netWorthSnapshot: NetWorthSnapshot | null;
}

export function useNetWorthSnapshotData() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading } = useQuery<SnapshotData>(
    GET_NET_WORTH_SNAPSHOT,
    { variables: { id } }
  );

  const snapshot = data?.netWorthSnapshot ?? null;
  const assets =
    snapshot?.entries.filter((entry) => entry.type === 'ASSET') ?? [];
  const liabilities =
    snapshot?.entries.filter((entry) => entry.type === 'LIABILITY') ?? [];
  const isPositive = (snapshot?.netWorth ?? 0) >= 0;

  return {
    assets,
    error: !!error,
    isPositive,
    liabilities,
    loading,
    snapshot,
  };
}
