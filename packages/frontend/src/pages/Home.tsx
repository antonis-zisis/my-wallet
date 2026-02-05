import { useQuery } from '@apollo/client/react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ThemeToggle from '../components/ThemeToggle';
import { HEALTH_QUERY } from '../graphql/operations';

export default function Home() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);

  const getStatusMessage = () => {
    if (loading) return 'Connecting...';
    if (error) return 'Failed to connect to server';
    return data?.health ?? 'Connected';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-2 flex items-center justify-center gap-2">
          <h1 className="text-center text-3xl font-bold text-gray-800 dark:text-gray-100">
            My Wallet
          </h1>
          <ThemeToggle />
        </div>
        <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Status: {getStatusMessage()}
        </p>

        <div className="space-y-6">
          <TransactionForm />
          <TransactionList />
        </div>
      </div>
    </div>
  );
}
