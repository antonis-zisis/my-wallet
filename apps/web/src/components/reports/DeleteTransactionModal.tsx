import { Button, Modal } from '../ui';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionDescription: string;
  isDeleting: boolean;
}

export function DeleteTransactionModal({
  isDeleting,
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
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
      <p className="text-text-secondary">
        Are you sure you want to delete{' '}
        <span className="font-semibold">{transactionDescription}</span>? This
        action cannot be undone.
      </p>
    </Modal>
  );
}
