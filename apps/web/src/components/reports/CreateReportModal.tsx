import { useState } from 'react';

import { Button, Input, Modal } from '../ui';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
}

export function CreateReportModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateReportModalProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const isValid =
    trimmedTitle.length >= MIN_TITLE_LENGTH &&
    trimmedTitle.length <= MAX_TITLE_LENGTH;

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(trimmedTitle);
      setTitle('');
    } catch {
      // error is shown as a toast by the caller
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Report"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={isSubmitting}
          >
            Create
          </Button>
        </>
      }
    >
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="report-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Report Title
          </label>

          <span className="text-xs text-gray-400">
            {title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>

        <Input
          id="report-title"
          placeholder="Enter report title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_TITLE_LENGTH}
          autoFocus
        />

        <p className="mt-1 text-xs text-gray-400">
          Between {MIN_TITLE_LENGTH}–{MAX_TITLE_LENGTH} characters
        </p>
      </div>
    </Modal>
  );
}
