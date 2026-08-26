import { Transaction } from '../../types/transaction';
import { formatDate } from '../../utils/formatDate';
import { Avatar, Badge, Dropdown, MoneyAmount, Tooltip } from '../ui';
import { AvatarDisplayData } from '../ui/Avatar';

type TransactionTableRowProps = {
  authorAvatarData: AvatarDisplayData | null;
  hasAuthorColumn: boolean;
  isEven: boolean;
  isLocked: boolean;
  transaction: Transaction;
  onDelete?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
};

export function TransactionTableRow({
  authorAvatarData,
  hasAuthorColumn,
  isEven,
  isLocked,
  onDelete,
  onEdit,
  transaction,
}: TransactionTableRowProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <tr
      className={`border-border border-b ${isEven ? 'bg-bg-app' : 'bg-bg-surface'}`}
    >
      <td className="text-text-secondary py-3 pr-4 pl-1 text-sm">
        {formatDate(transaction.date)}
      </td>

      <td className="py-3 pr-4">
        <Badge variant={isIncome ? 'success' : 'danger'}>
          {isIncome ? 'Income' : 'Expense'}
        </Badge>
      </td>

      <td className="py-3 pr-4">
        <Badge variant="default">{transaction.category}</Badge>
      </td>

      <td className="text-text-primary py-3 pr-4 text-sm">
        {transaction.description}
      </td>

      {hasAuthorColumn && (
        <td className="py-3 pr-4">
          {authorAvatarData && (
            <Tooltip content={authorAvatarData.label}>
              <Avatar {...authorAvatarData} size="xs" />
            </Tooltip>
          )}
        </td>
      )}

      <td
        className={`py-3 pr-1 text-right text-sm font-medium ${
          isIncome
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        <MoneyAmount amount={transaction.amount} sign={isIncome ? '+' : '-'} />
      </td>

      <td className="py-3 pl-2">
        {!isLocked && (
          <Dropdown
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
      </td>
    </tr>
  );
}
