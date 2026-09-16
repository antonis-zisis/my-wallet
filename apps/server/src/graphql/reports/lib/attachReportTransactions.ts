import { Transaction } from '../../../generated/prisma/client';
import prisma from '../../../lib/prisma';

const MAX_PRELOADED_TRANSACTIONS = 5000;

type ReportIdentity = { id: string };

export async function attachReportTransactions<
  ReportItem extends ReportIdentity,
>(
  reports: Array<ReportItem>
): Promise<Array<ReportItem & { transactions: Array<Transaction> }>> {
  if (reports.length === 0) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: { reportId: { in: reports.map((report) => report.id) } },
    orderBy: { date: 'desc' },
    take: MAX_PRELOADED_TRANSACTIONS,
  });

  const transactionsByReport = new Map<string, Array<Transaction>>();

  for (const transaction of transactions) {
    const current = transactionsByReport.get(transaction.reportId) ?? [];

    current.push(transaction);
    transactionsByReport.set(transaction.reportId, current);
  }

  return reports.map((report) => ({
    ...report,
    transactions: transactionsByReport.get(report.id) ?? [],
  }));
}
