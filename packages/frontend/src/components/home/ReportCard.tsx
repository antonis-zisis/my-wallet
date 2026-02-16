import { Report } from '../../types/report';
import { formatMoney } from '../../utils/formatMoney';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { Badge, Card } from '../ui';

export function ReportCard({
  label,
  report,
}: {
  label: string;
  report: Report;
}) {
  const transactions = report.transactions ?? [];
  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
          {report.title}
        </span>

        <Badge variant="info">{label}</Badge>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <p className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
          <ArrowUpIcon className="size-4" />
          {formatMoney(totalIncome)} &euro;
        </p>

        <p className="flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400">
          <ArrowDownIcon className="size-4" />
          {formatMoney(totalExpenses)} &euro;
        </p>
      </div>
    </Card>
  );
}
