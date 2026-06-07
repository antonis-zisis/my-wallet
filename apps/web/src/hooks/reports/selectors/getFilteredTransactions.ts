import { Transaction } from '../../../types/transaction';

export type TypeFilter = 'All' | 'Income' | 'Expense';

export function getFilteredTransactions(
  transactions: Array<Transaction>,
  typeFilter: TypeFilter,
  categoryFilter: string
): Array<Transaction> {
  return transactions.filter((transaction) => {
    const matchesType =
      typeFilter === 'All' ||
      (typeFilter === 'Income' && transaction.type === 'INCOME') ||
      (typeFilter === 'Expense' && transaction.type === 'EXPENSE');

    const matchesCategory =
      categoryFilter === 'All' || transaction.category === categoryFilter;

    return matchesType && matchesCategory;
  });
}
