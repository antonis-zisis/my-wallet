import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { ReportMember } from '../../types/report';
import { Transaction } from '../../types/transaction';
import { getAvatarData } from '../../utils/getAvatarData';
import { Button, Card, MoneyAmount } from '../ui';
import { TransactionCard } from './TransactionCard';
import { TransactionFilterBar } from './TransactionFilterBar';
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionTableRow } from './TransactionTableRow';

type TransactionTableProps = {
  isLocked?: boolean;
  members?: Array<ReportMember>;
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
  members = [],
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
  const isMobile = useIsMobileViewport();

  const isShared = members.length > 1;
  const ownerMember = members.find((member) => member.role === 'OWNER');
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

  const authorAvatarDataFor = (transaction: Transaction) => {
    const author = transaction.createdById
      ? members.find((member) => member.userId === transaction.createdById)
      : ownerMember;

    return author ? getAvatarData(author) : null;
  };

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
      {isMobile && (
        <TransactionFilterBar
          categoryFilterItems={categoryFilterItems}
          hasMultipleTypes={hasMultipleTypes}
          presentCategoriesCount={presentCategoriesForType.length}
          selectedCategoryFilter={selectedCategoryFilter}
          selectedTypeFilter={selectedTypeFilter}
          typeFilterItems={typeFilterItems}
        />
      )}

      {transactions.length === 0 ? (
        <p className="text-text-secondary py-6 text-center text-sm">
          No transactions match the selected filters
        </p>
      ) : (
        <>
          <div className="text-text-secondary mb-3 flex justify-between gap-3 text-sm">
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

          {isMobile ? (
            <ul className="divide-border divide-y">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  authorAvatarData={authorAvatarDataFor(transaction)}
                  isLocked={isLocked}
                  showAuthor={isShared}
                  transaction={transaction}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          ) : (
            <table className="w-full">
              <TransactionTableHeader
                categoryFilterItems={categoryFilterItems}
                hasAuthorColumn={isShared}
                hasMultipleTypes={hasMultipleTypes}
                presentCategoriesCount={presentCategoriesForType.length}
                selectedCategoryFilter={selectedCategoryFilter}
                selectedTypeFilter={selectedTypeFilter}
                typeFilterItems={typeFilterItems}
              />

              <tbody>
                {transactions.map((transaction, index) => (
                  <TransactionTableRow
                    key={transaction.id}
                    authorAvatarData={authorAvatarDataFor(transaction)}
                    hasAuthorColumn={isShared}
                    isEven={index % 2 === 0}
                    isLocked={isLocked}
                    transaction={transaction}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </Card>
  );
}
