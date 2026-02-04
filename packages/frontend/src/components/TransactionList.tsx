import { Transaction } from '../types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const sortedTransactions = [...transactions].sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime()
  );

  const formatAmount = (transaction: Transaction) => {
    const sign = transaction.type === 'income' ? '+' : '-';
    return `${sign}$${transaction.amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Transactions
        </h2>
        <p className="text-center text-gray-500">
          No transactions yet. Add your first one above!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Transactions</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
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
                className={`border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="py-3 pr-4 text-sm text-gray-600">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-sm text-gray-600">
                  {transaction.category}
                </td>
                <td className="py-3 pr-4 text-sm text-gray-800">
                  {transaction.description}
                </td>
                <td
                  className={`py-3 text-right text-sm font-medium ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
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
