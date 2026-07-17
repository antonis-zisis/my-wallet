import { useState } from 'react';

import { ReportMember, ReportRole } from '../../types/report';
import { getAvatarData } from '../../utils/getAvatarData';
import { XMarkIcon } from '../icons';
import { Avatar, Button, Input, Modal, Select } from '../ui';

const ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Can view' },
  { value: 'EDITOR', label: 'Can edit' },
];

const ROLE_LABELS: Record<ReportRole, string> = {
  OWNER: 'Owner',
  EDITOR: 'Can edit',
  VIEWER: 'Can view',
};

type ShareReportModalProps = {
  currentUserId: string;
  isLeaving: boolean;
  isOpen: boolean;
  isSharing: boolean;
  members: Array<ReportMember>;
  myRole: ReportRole;
  onClose: () => void;
  onLeaveReport: () => void;
  onShareReport: (email: string, role: ReportRole) => Promise<void>;
  onUnshareMember: (shareId: string) => void;
  onUpdateMemberRole: (shareId: string, role: ReportRole) => void;
};

type MemberRowProps = {
  isCurrentUser: boolean;
  isOwnerView: boolean;
  member: ReportMember;
  onUnshareMember: (shareId: string) => void;
  onUpdateMemberRole: (shareId: string, role: ReportRole) => void;
};

function MemberRow({
  isCurrentUser,
  isOwnerView,
  member,
  onUnshareMember,
  onUpdateMemberRole,
}: MemberRowProps) {
  const displayName = member.fullName ?? member.email;

  return (
    <li className="flex items-center gap-3 py-2">
      <Avatar {...getAvatarData(member)} />

      <div className="min-w-0 flex-1">
        <p className="text-text-primary truncate text-sm font-medium">
          {displayName}
          {isCurrentUser && ' (You)'}
        </p>

        {member.fullName && (
          <p className="text-text-tertiary truncate text-xs">{member.email}</p>
        )}
      </div>

      {isOwnerView && member.role !== 'OWNER' ? (
        <div className="flex shrink-0 items-center gap-1">
          <Select
            aria-label={`Role of ${displayName}`}
            className="w-28 py-1! text-sm"
            options={ROLE_OPTIONS}
            value={member.role}
            onChange={(event) =>
              onUpdateMemberRole(member.id, event.target.value as ReportRole)
            }
          />

          <Button
            aria-label={`Remove ${displayName}`}
            size="sm"
            variant="ghost"
            onClick={() => onUnshareMember(member.id)}
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <span className="text-text-tertiary shrink-0 text-xs">
          {ROLE_LABELS[member.role]}
        </span>
      )}
    </li>
  );
}

export function ShareReportModal({
  currentUserId,
  isLeaving,
  isOpen,
  isSharing,
  members,
  myRole,
  onClose,
  onLeaveReport,
  onShareReport,
  onUnshareMember,
  onUpdateMemberRole,
}: ShareReportModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ReportRole>('VIEWER');

  const isOwnerView = myRole === 'OWNER';
  const trimmedEmail = email.trim();
  const isEmailValid = trimmedEmail.includes('@');

  const handleShare = async () => {
    if (!isEmailValid || isSharing) {
      return;
    }

    try {
      await onShareReport(trimmedEmail, role);
      setEmail('');
    } catch {
      // error is shown as a toast by the caller
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleShare();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isOwnerView ? 'Share Report' : 'Report Members'}
      footer={
        isOwnerView ? undefined : (
          <Button
            isLoading={isLeaving}
            variant="danger"
            onClick={onLeaveReport}
          >
            Leave Report
          </Button>
        )
      }
    >
      {isOwnerView && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Input
              id="share-email"
              className="py-1! text-sm"
              label="Email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Select
            aria-label="Role"
            className="w-28 py-1! text-sm"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(event) => setRole(event.target.value as ReportRole)}
          />

          <Button
            disabled={!isEmailValid}
            isLoading={isSharing}
            size="xs"
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      )}

      <p className="text-text-secondary mb-1 text-sm font-medium">Members</p>

      <ul className="divide-border divide-y">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            isCurrentUser={member.userId === currentUserId}
            isOwnerView={isOwnerView}
            member={member}
            onUnshareMember={onUnshareMember}
            onUpdateMemberRole={onUpdateMemberRole}
          />
        ))}
      </ul>
    </Modal>
  );
}
