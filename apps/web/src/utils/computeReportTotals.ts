import { Transaction } from '../types/transaction';

type ReportTotals = {
  totalExpenses: number;
  totalIncome: number;
};

export function computeReportTotals(
  transactions: Array<Transaction> = []
): ReportTotals {
  return transactions.reduce<ReportTotals>(
    (totals, transaction) => {
      if (transaction.type === 'INCOME') {
        totals.totalIncome += transaction.amount;
      } else {
        totals.totalExpenses += transaction.amount;
      }

      return totals;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );
}
