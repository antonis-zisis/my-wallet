import { Button, Modal } from '../ui';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string;
  isCancelling: boolean;
}

export function CancelSubscriptionModal({
  isCancelling,
  isOpen,
  onClose,
  onConfirm,
  subscriptionName,
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
      <p className="text-text-secondary">
        Are you sure you want to cancel{' '}
        <span className="font-semibold">{subscriptionName}</span>? It will
        remain active until the end of the current billing period, then move to
        the inactive section.
      </p>
    </Modal>
  );
}
