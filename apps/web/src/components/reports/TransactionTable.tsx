import { Transaction } from '../../types/transaction';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { FilterIcon } from '../icons';
import { Badge, Button, Card, Dropdown } from '../ui';

interface TransactionTableProps {
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
}

function formatAmount(transaction: Transaction) {
  const sign = transaction.type === 'INCOME' ? '+' : '-';
  return `${sign}${formatMoney(transaction.amount)} €`;
}

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
          <div className="text-text-secondary mb-3 text-sm">
            {transactions.length}{' '}
            {transactions.length === 1 ? 'transaction' : 'transactions'}
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-border text-text-secondary border-b text-left text-sm font-medium">
                <th className="pr-4 pb-3">Date</th>
                <th className="pr-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    Type
                    {hasMultipleTypes && (
                      <Dropdown
                        align="left"
                        className="relative inline-flex items-center"
                        items={typeFilterItems}
                        trigger={
                          <button className="hover:bg-bg-muted cursor-pointer rounded p-0.5">
                            <FilterIcon
                              className={`h-3.5 w-3.5 ${selectedTypeFilter !== 'All' ? 'text-brand-500' : 'text-text-tertiary'}`}
                            />
                          </button>
                        }
                      />
                    )}
                  </div>
                </th>
                <th className="pr-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    Category
                    {presentCategoriesForType.length > 0 && (
                      <Dropdown
                        align="left"
                        className="relative inline-flex items-center"
                        items={categoryFilterItems}
                        trigger={
                          <button className="hover:bg-bg-muted cursor-pointer rounded p-0.5">
                            <FilterIcon
                              className={`h-3.5 w-3.5 ${selectedCategoryFilter !== 'All' ? 'text-brand-500' : 'text-text-tertiary'}`}
                            />
                          </button>
                        }
                      />
                    )}
                  </div>
                </th>
                <th className="pr-4 pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3"></th>
              </tr>
            </thead>

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
                    {formatAmount(transaction)}
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
