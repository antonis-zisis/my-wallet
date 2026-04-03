import { useState } from 'react';

import { Button, Dropdown, Input } from '../ui';

interface ReportHeaderProps {
  title: string;
  onSaveTitle: (title: string) => void;
  onAddTransaction: () => void;
  onDeleteReport: () => void;
}

export function ReportHeader({
  title,
  onSaveTitle,
  onAddTransaction,
  onDeleteReport,
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
    <div className="mb-6 flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
          <button
            onClick={handleStartEditing}
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Edit title"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button onClick={onAddTransaction}>Add Transaction</Button>
        <Dropdown
          items={[
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
