import { Transaction } from '../../types/transaction';
import { formatDate } from '../../utils/formatDate';
import { Avatar, Badge, Dropdown, MoneyAmount } from '../ui';
import { AvatarDisplayData } from '../ui/Avatar';

type TransactionCardProps = {
  authorAvatarData: AvatarDisplayData | null;
  isLocked: boolean;
  showAuthor: boolean;
  transaction: Transaction;
  onDelete?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
};

export function TransactionCard({
  authorAvatarData,
  isLocked,
  onDelete,
  onEdit,
  showAuthor,
  transaction,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <li className="flex items-start gap-1 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-text-primary min-w-0 flex-1 text-sm font-medium">
            {transaction.description}
          </p>

          <span
            className={`shrink-0 text-sm font-semibold ${
              isIncome
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            <MoneyAmount
              amount={transaction.amount}
              sign={isIncome ? '+' : '-'}
            />
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <Badge size="sm" variant={isIncome ? 'success' : 'danger'}>
            {isIncome ? 'Income' : 'Expense'}
          </Badge>

          <Badge size="sm" variant="default">
            {transaction.category}
          </Badge>

          <span className="text-text-tertiary text-xs">
            {formatDate(transaction.date)}
          </span>

          {showAuthor && authorAvatarData && (
            <Avatar {...authorAvatarData} size="xs" />
          )}
        </div>
      </div>

      {!isLocked && (
        <Dropdown
          className="relative shrink-0"
          items={[
            { label: 'Edit', onClick: () => onEdit?.(transaction) },
            {
              label: 'Delete',
              variant: 'danger' as const,
              onClick: () => onDelete?.(transaction),
            },
          ]}
        />
      )}
    </li>
  );
}
