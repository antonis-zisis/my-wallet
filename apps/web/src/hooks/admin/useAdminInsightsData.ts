import { useQuery } from '@apollo/client/react';

import { GET_ADMIN_INSIGHTS } from '../../graphql/admin';
import { AdminInsightsData } from '../../types/admin';

export function useAdminInsightsData() {
  const { data, error, loading, refetch } = useQuery<AdminInsightsData>(
    GET_ADMIN_INSIGHTS,
    { notifyOnNetworkStatusChange: true }
  );

  return {
    error: !!error,
    insights: data?.adminInsights ?? null,
    loading,
    onRefresh: () => refetch(),
  };
}
