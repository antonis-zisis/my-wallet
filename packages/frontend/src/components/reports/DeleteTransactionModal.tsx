import { Button, Modal } from '../ui';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionDescription: string;
  isDeleting: boolean;
}

export function DeleteTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
  isDeleting,
}: DeleteTransactionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Transaction"
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
        <span className="font-semibold">{transactionDescription}</span>? This
        action cannot be undone.
      </p>
    </Modal>
  );
}
