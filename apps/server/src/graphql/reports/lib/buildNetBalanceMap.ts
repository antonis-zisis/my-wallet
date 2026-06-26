type GroupedTransactionSum = {
  reportId: string;
  type: string;
  _sum: { amount: number | null };
};

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
