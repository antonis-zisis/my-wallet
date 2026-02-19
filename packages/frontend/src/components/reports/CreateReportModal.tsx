import { useState } from 'react';

import { Button, Input, Modal } from '../ui';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function CreateReportModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateReportModalProps) {
  const [title, setTitle] = useState('');

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    setTitle('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Report"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create
          </Button>
        </>
      }
    >
      <Input
        label="Report Title"
        id="report-title"
        placeholder="Enter report title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus
      />
    </Modal>
  );
}
