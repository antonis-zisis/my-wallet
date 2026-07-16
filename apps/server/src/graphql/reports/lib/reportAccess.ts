import { Report, ReportShare } from '../../../generated/prisma/client';
import prisma from '../../../lib/prisma';
import { SHARE_ROLES } from '../../../lib/validate';

export type ShareRole = (typeof SHARE_ROLES)[number];
export type ReportRole = 'OWNER' | ShareRole;

export type ReportAccess = {
  report: Report & { shares: Array<ReportShare> };
  role: ReportRole;
};

export function reportAccessWhere(userId: string) {
  return { OR: [{ userId }, { shares: { some: { userId } } }] };
}

export async function resolveReportAccess(
  reportId: string,
  userId: string
): Promise<ReportAccess | null> {
  const report = await prisma.report.findFirst({
    where: { id: reportId },
    include: { shares: true },
  });

  if (!report) {
    return null;
  }

  if (report.userId === userId) {
    return { report, role: 'OWNER' };
  }

  const share = report.shares.find((candidate) => candidate.userId === userId);

  if (!share) {
    return null;
  }

  return { report, role: share.role as ShareRole };
}
