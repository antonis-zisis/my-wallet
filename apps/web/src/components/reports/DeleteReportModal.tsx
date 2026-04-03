import { Button, Modal } from '../ui';

interface DeleteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportTitle: string;
  isDeleting: boolean;
}

export function DeleteReportModal({
  isOpen,
  onClose,
  onConfirm,
  reportTitle,
  isDeleting,
}: DeleteReportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Report"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-gray-600 dark:text-gray-300">
        Are you sure you want to delete{' '}
        <span className="font-semibold">{reportTitle}</span>? All transactions
        in this report will be permanently deleted.
      </p>
    </Modal>
  );
}
