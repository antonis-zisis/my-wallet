import { Transaction, TransactionType } from '../../../types/transaction';

export function getPresentCategories(
  categories: ReadonlyArray<string>,
  transactions: Array<Transaction>,
  type: TransactionType
): Array<string> {
  return categories.filter((category) =>
    transactions.some(
      (transaction) =>
        transaction.category === category && transaction.type === type
    )
  );
}
