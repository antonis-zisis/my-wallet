import { Button, Modal } from '../ui';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string;
  isCancelling: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  subscriptionName,
  isCancelling,
}: CancelSubscriptionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Subscription"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isCancelling}>
            Cancel Subscription
          </Button>
        </>
      }
    >
      <p className="text-gray-600 dark:text-gray-300">
        Are you sure you want to cancel{' '}
        <span className="font-semibold">{subscriptionName}</span>? It will be
        moved to the inactive section.
      </p>
    </Modal>
  );
}
