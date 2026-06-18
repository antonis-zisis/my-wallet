import { Transaction } from '../../types/transaction';
import { formatDate } from '../../utils/formatDate';
import { Badge, Button, Card, Dropdown, MoneyAmount } from '../ui';
import { TransactionTableHeader } from './TransactionTableHeader';

type TransactionTableProps = {
  isLocked?: boolean;
  presentExpenseCategories?: ReadonlyArray<string>;
  presentIncomeCategories?: ReadonlyArray<string>;
  selectedCategoryFilter?: string;
  selectedTypeFilter?: 'All' | 'Income' | 'Expense';
  transactions: Array<Transaction>;
  onAddTransaction?: () => void;
  onDelete?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onSelectCategoryFilter?: (category: string) => void;
  onSelectTypeFilter?: (type: 'All' | 'Income' | 'Expense') => void;
};

export function TransactionTable({
  isLocked = false,
  onAddTransaction,
  onDelete,
  onEdit,
  onSelectCategoryFilter,
  onSelectTypeFilter,
  presentExpenseCategories = [],
  presentIncomeCategories = [],
  selectedCategoryFilter = 'All',
  selectedTypeFilter = 'All',
  transactions,
}: TransactionTableProps) {
  const hasMultipleTypes =
    presentExpenseCategories.length > 0 && presentIncomeCategories.length > 0;

  const presentCategoriesForType =
    selectedTypeFilter === 'Income'
      ? presentIncomeCategories
      : presentExpenseCategories;

  const typeFilterItems: Array<{ label: string; onClick: () => void }> = [
    { label: 'All', onClick: () => onSelectTypeFilter?.('All') },
    ...(presentIncomeCategories.length > 0
      ? [{ label: 'Income', onClick: () => onSelectTypeFilter?.('Income') }]
      : []),
    ...(presentExpenseCategories.length > 0
      ? [{ label: 'Expense', onClick: () => onSelectTypeFilter?.('Expense') }]
      : []),
  ];

  const categoryFilterItems: Array<{ label: string; onClick: () => void }> = [
    { label: 'All', onClick: () => onSelectCategoryFilter?.('All') },
    ...presentCategoriesForType.map((category) => ({
      label: category,
      onClick: () => onSelectCategoryFilter?.(category),
    })),
  ];

  const netTotal = transactions.reduce(
    (sum, transaction) =>
      transaction.type === 'INCOME'
        ? sum + transaction.amount
        : sum - transaction.amount,
    0
  );

  if (
    transactions.length === 0 &&
    selectedTypeFilter === 'All' &&
    selectedCategoryFilter === 'All'
  ) {
    return (
      <Card className="mt-4">
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
          <p className="text-text-secondary text-sm font-medium">
            No transactions yet
          </p>
          {onAddTransaction && (
            <Button size="sm" onClick={onAddTransaction}>
              Add Transaction
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      {transactions.length === 0 ? (
        <p className="text-text-secondary py-6 text-center text-sm">
          No transactions match the selected filters
        </p>
      ) : (
        <>
          <div className="text-text-secondary mb-3 flex justify-between text-sm">
            <span>
              {transactions.length}{' '}
              {transactions.length === 1 ? 'transaction' : 'transactions'}
            </span>

            {(selectedTypeFilter !== 'All' ||
              selectedCategoryFilter !== 'All') && (
              <span
                className={`font-medium ${
                  netTotal >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <MoneyAmount
                  amount={Math.abs(netTotal)}
                  sign={netTotal >= 0 ? '+' : '-'}
                />
              </span>
            )}
          </div>

          <table className="w-full">
            <TransactionTableHeader
              categoryFilterItems={categoryFilterItems}
              hasMultipleTypes={hasMultipleTypes}
              presentCategoriesCount={presentCategoriesForType.length}
              selectedCategoryFilter={selectedCategoryFilter}
              selectedTypeFilter={selectedTypeFilter}
              typeFilterItems={typeFilterItems}
            />

            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-border border-b ${
                    index % 2 === 0 ? 'bg-bg-app' : 'bg-bg-surface'
                  }`}
                >
                  <td className="text-text-secondary py-3 pr-4 pl-1 text-sm">
                    {formatDate(transaction.date)}
                  </td>

                  <td className="py-3 pr-4">
                    <Badge
                      variant={
                        transaction.type === 'INCOME' ? 'success' : 'danger'
                      }
                    >
                      {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                    </Badge>
                  </td>

                  <td className="py-3 pr-4">
                    <Badge variant="default">{transaction.category}</Badge>
                  </td>

                  <td className="text-text-primary py-3 pr-4 text-sm">
                    {transaction.description}
                  </td>

                  <td
                    className={`py-3 pr-1 text-right text-sm font-medium ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <MoneyAmount
                      amount={transaction.amount}
                      sign={transaction.type === 'INCOME' ? '+' : '-'}
                    />
                  </td>

                  <td className="py-3 pl-2">
                    {!isLocked && (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Card>
  );
}
