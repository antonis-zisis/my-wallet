import { Transaction } from '../../types/transaction';
import { formatMoney } from '../../utils/formatMoney';

interface ReportSummaryProps {
  transactions: Transaction[];
}

export function ReportSummary({ transactions }: ReportSummaryProps) {
  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>

        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatMoney(totalIncome)} &euro;
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Expenses
        </p>

        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {formatMoney(totalExpenses)} &euro;
        </p>
      </div>
    </div>
  );
}
