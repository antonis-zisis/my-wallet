// Composed by useReportsData (list page) and useReportData (report page).
import { useMutation } from '@apollo/client/react';

import { useToast } from '../../contexts/ToastContext';
import {
  LEAVE_SHARED_REPORT,
  SHARE_REPORT,
  UNSHARE_REPORT,
  UPDATE_REPORT_SHARE_ROLE,
} from '../../graphql/reports';
import { ReportRole } from '../../types/report';

type UseReportSharingArgs = {
  reportId?: string;
  onLeft?: () => void;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useReportSharing({ onLeft, reportId }: UseReportSharingArgs) {
  const { showError, showSuccess } = useToast();

  const [shareReport, { loading: isSharing }] = useMutation(SHARE_REPORT);
  const [updateReportShareRole] = useMutation(UPDATE_REPORT_SHARE_ROLE);
  const [unshareReport] = useMutation(UNSHARE_REPORT);
  const [leaveSharedReport, { loading: isLeaving }] =
    useMutation(LEAVE_SHARED_REPORT);

  const onShareReport = async (email: string, role: ReportRole) => {
    if (!reportId) {
      return;
    }

    try {
      await shareReport({ variables: { input: { reportId, email, role } } });
      showSuccess('Report shared.');
    } catch (error) {
      showError(errorMessage(error, 'Failed to share report.'));
      throw new Error('Failed to share report.', { cause: error });
    }
  };

  const onUpdateMemberRole = async (shareId: string, role: ReportRole) => {
    try {
      await updateReportShareRole({
        variables: { input: { id: shareId, role } },
      });
      showSuccess('Member role updated.');
    } catch (error) {
      showError(errorMessage(error, 'Failed to update member role.'));
    }
  };

  const onUnshareMember = async (shareId: string) => {
    try {
      await unshareReport({ variables: { id: shareId } });
      showSuccess('Member removed.');
    } catch (error) {
      showError(errorMessage(error, 'Failed to remove member.'));
    }
  };

  const onLeaveReport = async () => {
    if (!reportId) {
      return;
    }

    try {
      await leaveSharedReport({
        variables: { reportId },
        update: (cache) => {
          cache.evict({
            id: cache.identify({ __typename: 'Report', id: reportId }),
          });
          cache.gc();
        },
      });
      showSuccess('You left the report.');
      onLeft?.();
    } catch (error) {
      showError(errorMessage(error, 'Failed to leave report.'));
    }
  };

  return {
    isLeaving,
    isSharing,
    onLeaveReport,
    onShareReport,
    onUnshareMember,
    onUpdateMemberRole,
  };
}
