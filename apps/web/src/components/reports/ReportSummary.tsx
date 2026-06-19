import { Transaction } from '../../types/transaction';
import { Card, MoneyAmount } from '../ui';

type ReportSummaryProps = {
  transactions: Array<Transaction>;
};

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
        <p className="text-text-secondary text-sm">Total Income</p>

        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          <MoneyAmount amount={totalIncome} />
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary text-sm">Total Expenses</p>

        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          <MoneyAmount amount={totalExpenses} />
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary text-sm">Net Balance</p>

        <p
          className={`text-2xl font-bold ${isPositiveBalance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          <MoneyAmount
            amount={netBalance}
            sign={isPositiveBalance ? '+' : ''}
          />
        </p>
      </Card>
    </div>
  );
}
