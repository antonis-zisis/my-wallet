import { Link } from 'react-router';

import { Report } from '../../types/report';
import { computeSavingsRate } from '../../utils/computeSavingsRate';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { Badge, Card, MoneyAmount } from '../ui';

type ReportCardProps = {
  label: string;
  report: Report;
};

export function ReportCard({ label, report }: ReportCardProps) {
  const transactions = report.transactions ?? [];

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const savingsRate = computeSavingsRate({ totalExpenses, totalIncome });

  return (
    <Link to={`/reports/${report.id}`} className="block">
      <Card className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-text-primary text-xs font-semibold">
            {report.title}
          </span>

          <Badge variant="info">{label}</Badge>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <p className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
            <ArrowUpIcon className="size-4" />
            <MoneyAmount amount={totalIncome} />
          </p>

          <p className="flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400">
            <ArrowDownIcon className="size-4" />
            <MoneyAmount amount={totalExpenses} />
          </p>
        </div>

        {savingsRate !== null && (
          <p
            className={`mt-2 text-xs font-medium ${
              savingsRate >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {savingsRate >= 0
              ? `Saved ${savingsRate}% of income`
              : `Overspent by ${Math.abs(savingsRate)}% of income`}
          </p>
        )}
      </Card>
    </Link>
  );
}
