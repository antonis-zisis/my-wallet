import { useQuery } from '@apollo/client/react';
import { GET_TRANSACTIONS } from '../graphql/operations';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface TransactionsData {
  transactions: Transaction[];
}

export default function TransactionList() {
  const { data, loading, error } = useQuery<TransactionsData>(GET_TRANSACTIONS);

  const formatAmount = (transaction: Transaction) => {
    const sign = transaction.type === 'INCOME' ? '+' : '-';
    return `${sign}$${transaction.amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Transactions
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading transactions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Transactions
        </h2>
        <p className="text-center text-red-500">
          Failed to load transactions: {error.message}
        </p>
      </div>
    );
  }

  const transactions = data?.transactions ?? [];

  const sortedTransactions = [...transactions].sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Transactions
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No transactions yet. Add your first one above!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
        Transactions
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border-b border-gray-100 dark:border-gray-700 ${
                  index % 2 === 0
                    ? 'bg-gray-50 dark:bg-gray-900'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">
                  {transaction.category}
                </td>
                <td className="py-3 pr-4 text-sm text-gray-800 dark:text-gray-200">
                  {transaction.description}
                </td>
                <td
                  className={`py-3 text-right text-sm font-medium ${
                    transaction.type === 'INCOME'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatAmount(transaction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
