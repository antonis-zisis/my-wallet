import { Button, Modal } from '../ui';

interface DeleteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string;
  isDeleting: boolean;
}

export function DeleteSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  subscriptionName,
  isDeleting,
}: DeleteSubscriptionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Subscription"
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
        <span className="font-semibold">{subscriptionName}</span>? This
        subscription will be permanently deleted.
      </p>
    </Modal>
  );
}
