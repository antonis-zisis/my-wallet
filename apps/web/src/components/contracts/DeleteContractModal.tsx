import { Button, Modal } from '../ui';

type DeleteContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contractName: string;
  isDeleting: boolean;
};

export function DeleteContractModal({
  contractName,
  isDeleting,
  isOpen,
  onClose,
  onConfirm,
}: DeleteContractModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Contract"
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
        <span className="font-semibold">{contractName}</span>? This contract
        will be permanently deleted.
      </p>
    </Modal>
  );
}
