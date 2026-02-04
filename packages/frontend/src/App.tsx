import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { Transaction } from './types/transaction';

export default function App() {
  const [message, setMessage] = useState<string>('Loading...');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Failed to connect to backend'));
  }, []);

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
          Backend status: {message}
        </p>

        <div className="space-y-6">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
