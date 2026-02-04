import { useQuery } from '@apollo/client/react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { HEALTH_QUERY } from './graphql/operations';

export default function App() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);

  const getStatusMessage = () => {
    if (loading) return 'Connecting...';
    if (error) return 'Failed to connect to server';
    return data?.health ?? 'Connected';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          My Wallet
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
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
