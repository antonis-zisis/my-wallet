import { useState } from 'react';

import { formatDate } from '../../utils/formatDate';
import { Button, Dropdown, Input } from '../ui';

interface ReportHeaderProps {
  createdAt: string;
  title: string;
  updatedAt: string;
  onAddTransaction: () => void;
  onDeleteReport: () => void;
  onSaveTitle: (title: string) => void;
}

export function ReportHeader({
  createdAt,
  onAddTransaction,
  onDeleteReport,
  onSaveTitle,
  title,
  updatedAt,
}: ReportHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

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
    <div className="mb-4 flex items-start justify-between">
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Created {formatDate(createdAt)} · Updated {formatDate(updatedAt)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={onAddTransaction}>Add Transaction</Button>

        <Dropdown
          items={[
            {
              label: 'Rename Report',
              onClick: handleStartEditing,
            },
            {
              label: 'Delete Report',
              onClick: onDeleteReport,
              variant: 'danger',
            },
          ]}
        />
      </div>
    </div>
  );
}
