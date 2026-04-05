import { Transaction } from '../../types/transaction';
import { formatMoney } from '../../utils/formatMoney';
import { Card } from '../ui';

interface ReportSummaryProps {
  transactions: Array<Transaction>;
}

export function ReportSummary({ transactions }: ReportSummaryProps) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const isPositiveBalance = netBalance >= 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>

        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatMoney(totalIncome)} &euro;
        </p>
      </Card>

      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Expenses
        </p>

        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {formatMoney(totalExpenses)} &euro;
        </p>
      </Card>

      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>

        <p
          className={`text-2xl font-bold ${isPositiveBalance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {isPositiveBalance ? '+' : ''}
          {formatMoney(netBalance)} &euro;
        </p>
      </Card>
    </div>
  );
}
