type GroupedTransactionSum = {
  reportId: string;
  type: string;
  _sum: { amount: number | null };
};

/**
 * Folds a `transaction.groupBy(['reportId', 'type'])` aggregate into a map of
 * `reportId -> net balance` (income minus expense). Reports with no
 * transactions are simply absent from the map; callers treat a miss as 0.
 */
export function buildNetBalanceMap(
  grouped: Array<GroupedTransactionSum>
): Map<string, number> {
  const netBalanceByReport = new Map<string, number>();

  for (const row of grouped) {
    const current = netBalanceByReport.get(row.reportId) ?? 0;
    const amount = row._sum.amount ?? 0;

    netBalanceByReport.set(
      row.reportId,
      row.type === 'INCOME' ? current + amount : current - amount
    );
  }

  return netBalanceByReport;
}
