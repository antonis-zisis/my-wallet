import {
  TransactionFormInput,
  TransactionFormModal,
} from './TransactionFormModal';

export type CreateTransactionInput = TransactionFormInput;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => void;
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
