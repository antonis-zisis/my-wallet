import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { Transaction } from './types/transaction';
import { HEALTH_QUERY } from './graphql/operations';

export default function App() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    if (loading) {
      setMessage('Loading...');
    } else if (error) {
      setMessage('Failed to connect to GraphQL server');
    } else if (data) {
      setMessage(data.health);
    }
  }, [data, loading, error]);

  const handleTransactionAdded = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          My Wallet
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          GraphQL status: {message}
        </p>

        <div className="space-y-6">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
