import { Transaction } from '../../types/transaction';
import { formatDate } from '../../utils/formatDate';
import { Badge, Dropdown } from '../ui';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

function formatAmount(transaction: Transaction) {
  const sign = transaction.type === 'INCOME' ? '+' : '-';
  return `${sign}${transaction.amount.toFixed(2)} €`;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No transactions yet. Add your first one!
      </p>
    );
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <th className="pr-4 pb-3">Date</th>
            <th className="pr-4 pb-3">Type</th>
            <th className="pr-4 pb-3">Category</th>
            <th className="pr-4 pb-3">Description</th>
            <th className="pb-3 text-right">Amount</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className={`border-b border-gray-100 dark:border-gray-700 ${
                index % 2 === 0
                  ? 'bg-gray-50 dark:bg-gray-900'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <td className="py-3 pr-4 pl-1 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(transaction.date)}
              </td>

              <td className="py-3 pr-4">
                <Badge
                  variant={transaction.type === 'INCOME' ? 'success' : 'danger'}
                >
                  {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
              </td>

              <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">
                {transaction.category}
              </td>

              <td className="py-3 pr-4 text-sm text-gray-800 dark:text-gray-200">
                {transaction.description}
              </td>

              <td
                className={`py-3 pr-1 text-right text-sm font-medium ${
                  transaction.type === 'INCOME'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatAmount(transaction)}
              </td>

              <td className="py-3 pl-2">
                <Dropdown
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => onEdit?.(transaction),
                    },
                    {
                      label: 'Delete',
                      variant: 'danger' as const,
                      onClick: () => onDelete?.(transaction),
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
