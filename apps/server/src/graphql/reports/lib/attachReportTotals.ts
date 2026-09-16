import prisma from '../../../lib/prisma';
import { buildNetBalanceMap } from './buildNetBalanceMap';

type ReportIdentity = { id: string };

export type ReportTotals = {
  netBalance: number;
  transactionCount: number;
};

export async function attachReportTotals<ReportItem extends ReportIdentity>(
  reports: Array<ReportItem>
): Promise<Array<ReportItem & ReportTotals>> {
  if (reports.length === 0) {
    return [];
  }

  const grouped = await prisma.transaction.groupBy({
    by: ['reportId', 'type'],
    where: { reportId: { in: reports.map((report) => report.id) } },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const netBalanceByReport = buildNetBalanceMap(grouped);
  const transactionCountByReport = new Map<string, number>();

  for (const row of grouped) {
    const current = transactionCountByReport.get(row.reportId) ?? 0;

    transactionCountByReport.set(row.reportId, current + row._count._all);
  }

  return reports.map((report) => ({
    ...report,
    netBalance: netBalanceByReport.get(report.id) ?? 0,
    transactionCount: transactionCountByReport.get(report.id) ?? 0,
  }));
}
