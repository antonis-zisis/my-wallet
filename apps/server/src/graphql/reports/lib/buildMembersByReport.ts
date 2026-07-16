import { ReportShare, User } from '../../../generated/prisma/client';
import { ReportRole, ShareRole } from './reportAccess';

export type ReportMemberRecord = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: ReportRole;
};

type ReportIdentity = { id: string; userId: string };
type ShareWithUser = ReportShare & { user: User };

export function buildMembersByReport(
  reports: Array<ReportIdentity>,
  shares: Array<ShareWithUser>,
  owners: Array<User>
): Map<string, Array<ReportMemberRecord>> {
  const ownersBySupabaseId = new Map(
    owners.map((owner) => [owner.supabaseId, owner])
  );
  const membersByReport = new Map<string, Array<ReportMemberRecord>>();

  for (const report of reports) {
    const owner = ownersBySupabaseId.get(report.userId);

    membersByReport.set(
      report.id,
      owner
        ? [
            {
              id: report.userId,
              userId: report.userId,
              email: owner.email,
              fullName: owner.fullName,
              role: 'OWNER',
            },
          ]
        : []
    );
  }

  for (const share of shares) {
    const members = membersByReport.get(share.reportId);

    if (!members) {
      continue;
    }

    members.push({
      id: share.id,
      userId: share.userId,
      email: share.user.email,
      fullName: share.user.fullName,
      role: share.role as ShareRole,
    });
  }

  return membersByReport;
}
