import { TransactionFormInput } from '../../types/transaction';
import { TransactionFormModal } from './TransactionFormModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TransactionFormInput) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  return (
    <TransactionFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      mode="add"
    />
  );
}
