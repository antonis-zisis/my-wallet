type CategoryMonthlyTransaction = {
  amount: number;
  category: string;
  date: Date;
};

export type CategoryMonthlyTotal = {
  category: string;
  month: string;
  total: number;
};

function toMonthKey(date: Date): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');

  return `${date.getUTCFullYear()}-${month}`;
}

export function buildCategoryMonthlyTotals(
  transactions: Array<CategoryMonthlyTransaction>
): Array<CategoryMonthlyTotal> {
  const totalsByKey = new Map<string, CategoryMonthlyTotal>();

  for (const transaction of transactions) {
    const month = toMonthKey(transaction.date);
    const key = `${month}|${transaction.category}`;
    const existing = totalsByKey.get(key);

    if (existing) {
      existing.total += transaction.amount;
    } else {
      totalsByKey.set(key, {
        category: transaction.category,
        month,
        total: transaction.amount,
      });
    }
  }

  return [...totalsByKey.values()];
}
