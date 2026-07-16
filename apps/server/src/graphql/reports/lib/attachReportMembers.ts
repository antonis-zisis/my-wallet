import prisma from '../../../lib/prisma';
import {
  buildMembersByReport,
  ReportMemberRecord,
} from './buildMembersByReport';

const MAX_PRELOADED_SHARES = 1000;

type ReportIdentity = { id: string; userId: string };

export async function attachReportMembers<ReportItem extends ReportIdentity>(
  reports: Array<ReportItem>
): Promise<Array<ReportItem & { members: Array<ReportMemberRecord> }>> {
  if (reports.length === 0) {
    return [];
  }

  const ownerSupabaseIds = [...new Set(reports.map((report) => report.userId))];
  const [shares, owners] = await Promise.all([
    prisma.reportShare.findMany({
      where: { reportId: { in: reports.map((report) => report.id) } },
      include: { user: true },
      take: MAX_PRELOADED_SHARES,
    }),
    prisma.user.findMany({
      where: { supabaseId: { in: ownerSupabaseIds } },
      take: ownerSupabaseIds.length,
    }),
  ]);
  const membersByReport = buildMembersByReport(reports, shares, owners);

  return reports.map((report) => ({
    ...report,
    members: membersByReport.get(report.id) ?? [],
  }));
}
