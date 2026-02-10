import { useQuery } from '@apollo/client/react';
import { HEALTH_QUERY } from '../graphql/health';

export function Home() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);

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
      </div>
    </div>
  );
}
