import { Button, Modal } from '../ui';

interface DeleteNetWorthSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  snapshotTitle: string;
  isDeleting: boolean;
}

export function DeleteNetWorthSnapshotModal({
  isOpen,
  onClose,
  onConfirm,
  snapshotTitle,
  isDeleting,
}: DeleteNetWorthSnapshotModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Snapshot"
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
        <span className="font-semibold">{snapshotTitle}</span>? This snapshot
        will be permanently deleted.
      </p>
    </Modal>
  );
}
