import { Transaction, TransactionFormInput } from '../../types/transaction';
import { AddTransactionModal } from './AddTransactionModal';
import { DeleteReportModal } from './DeleteReportModal';
import { DeleteTransactionModal } from './DeleteTransactionModal';
import { TransactionFormModal } from './TransactionFormModal';

interface ReportModalsProps {
  deletingTransaction: Transaction | null;
  editingTransaction: Transaction | null;
  isAddTransactionModalOpen: boolean;
  isDeleteReportModalOpen: boolean;
  isDeleting: boolean;
  isDeletingTransaction: boolean;
  reportTitle: string;
  onCloseAddTransactionModal: () => void;
  onCloseDeleteReportModal: () => void;
  onCloseDeleteTransactionModal: () => void;
  onCloseEditTransactionModal: () => void;
  onConfirmDeleteReport: () => Promise<void>;
  onConfirmDeleteTransaction: () => Promise<void>;
  onCreateTransaction: (input: TransactionFormInput) => Promise<void>;
  onUpdateTransaction: (input: TransactionFormInput) => Promise<void>;
}

export function ReportModals({
  deletingTransaction,
  editingTransaction,
  isAddTransactionModalOpen,
  isDeleteReportModalOpen,
  isDeleting,
  isDeletingTransaction,
  onCloseAddTransactionModal,
  onCloseDeleteReportModal,
  onCloseDeleteTransactionModal,
  onCloseEditTransactionModal,
  onConfirmDeleteReport,
  onConfirmDeleteTransaction,
  onCreateTransaction,
  onUpdateTransaction,
  reportTitle,
}: ReportModalsProps) {
  return (
    <>
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={onCloseAddTransactionModal}
        onSubmit={onCreateTransaction}
      />

      <TransactionFormModal
        isOpen={editingTransaction !== null}
        mode="edit"
        transaction={editingTransaction ?? undefined}
        onClose={onCloseEditTransactionModal}
        onSubmit={onUpdateTransaction}
      />

      <DeleteTransactionModal
        isOpen={deletingTransaction !== null}
        isDeleting={isDeletingTransaction}
        transactionDescription={deletingTransaction?.description ?? ''}
        onClose={onCloseDeleteTransactionModal}
        onConfirm={onConfirmDeleteTransaction}
      />

      <DeleteReportModal
        isOpen={isDeleteReportModalOpen}
        isDeleting={isDeleting}
        reportTitle={reportTitle}
        onClose={onCloseDeleteReportModal}
        onConfirm={onConfirmDeleteReport}
      />
    </>
  );
}
