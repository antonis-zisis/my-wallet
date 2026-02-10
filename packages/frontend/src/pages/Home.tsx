import { useQuery } from '@apollo/client/react';

import { HEALTH_QUERY } from '../graphql/health';
import { GET_REPORTS } from '../graphql/reports';

export function Home() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const { data: reportsData } = useQuery<{
    reports: { totalCount: number };
  }>(GET_REPORTS);

  const getStatusMessage = () => {
    if (loading) {
      return 'Connecting...';
    }

    if (error) {
      return 'Failed to connect to server';
    }

    return data?.health ?? 'Connected';
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {getStatusMessage()}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Reports
            </p>

            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {reportsData?.reports.totalCount ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
