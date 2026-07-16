import { useState } from 'react';

import { ReportMember, ReportRole } from '../../types/report';
import { formatDate } from '../../utils/formatDate';
import { LockClosedIcon } from '../icons';
import { AvatarGroup, Button, Dropdown, Input } from '../ui';

type ReportHeaderProps = {
  createdAt: string;
  currentUserId: string;
  isLocked: boolean;
  members: Array<ReportMember>;
  myRole: ReportRole;
  title: string;
  updatedAt: string;
  onAddTransaction: () => void;
  onDeleteReport: () => void;
  onExportCsv: () => void;
  onLockReport: () => void;
  onOpenShareModal: () => void;
  onSaveTitle: (title: string) => void;
  onUnlockReport: () => void;
};

export function ReportHeader({
  createdAt,
  currentUserId,
  isLocked,
  members,
  myRole,
  onAddTransaction,
  onDeleteReport,
  onExportCsv,
  onLockReport,
  onOpenShareModal,
  onSaveTitle,
  onUnlockReport,
  title,
  updatedAt,
}: ReportHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  const isOwner = myRole === 'OWNER';
  const canEdit = myRole !== 'VIEWER';
  const otherMembers = members.filter(
    (member) => member.userId !== currentUserId
  );

  const handleStartEditing = () => {
    setEditTitle(title);
    setIsEditingTitle(true);
  };

  const handleCancelEditing = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === title) {
      handleCancelEditing();

      return;
    }

    onSaveTitle(trimmed);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveTitle();
    } else if (event.key === 'Escape') {
      handleCancelEditing();
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      {isEditingTitle ? (
        <div className="flex items-center gap-2">
          <Input
            id="edit-title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleCancelEditing}
            autoFocus
          />

          <Button
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleSaveTitle}
          >
            Save
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-text-primary text-2xl font-bold">{title}</h1>

            {isLocked && (
              <LockClosedIcon className="text-text-tertiary size-4" />
            )}

            {otherMembers.length > 0 && <AvatarGroup people={otherMembers} />}
          </div>

          <p className="text-text-tertiary mt-1 text-xs">
            Created {formatDate(createdAt)} · Updated {formatDate(updatedAt)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isLocked && canEdit && (
          <Button onClick={onAddTransaction}>Add Transaction</Button>
        )}

        <Dropdown
          className="relative flex"
          items={[
            ...(!isLocked && canEdit
              ? [
                  {
                    label: 'Rename Report',
                    onClick: handleStartEditing,
                  },
                ]
              : []),
            ...(isOwner
              ? [
                  {
                    label: isLocked ? 'Unlock Report' : 'Lock Report',
                    onClick: isLocked ? onUnlockReport : onLockReport,
                  },
                ]
              : []),
            {
              label: isOwner ? 'Share Report' : 'Members',
              onClick: onOpenShareModal,
            },
            {
              label: 'Export CSV',
              onClick: onExportCsv,
            },
            ...(!isLocked && isOwner
              ? [
                  {
                    label: 'Delete Report',
                    onClick: onDeleteReport,
                    variant: 'danger' as const,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </div>
  );
}
