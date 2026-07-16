import { useState } from 'react';

import { Transaction } from '../../types/transaction';

export function useReportModals() {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isBudgetChartOpen, setIsBudgetChartOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  return {
    deletingTransaction,
    editingTransaction,
    isAddTransactionModalOpen,
    isBudgetChartOpen,
    isChartOpen,
    isDeleteReportModalOpen,
    isShareModalOpen,
    onCloseAddTransactionModal: () => setIsAddTransactionModalOpen(false),
    onCloseDeleteReportModal: () => setIsDeleteReportModalOpen(false),
    onCloseDeleteTransactionModal: () => setDeletingTransaction(null),
    onCloseEditTransactionModal: () => setEditingTransaction(null),
    onCloseShareModal: () => setIsShareModalOpen(false),
    onOpenAddTransactionModal: () => setIsAddTransactionModalOpen(true),
    onOpenDeleteReportModal: () => setIsDeleteReportModalOpen(true),
    onOpenShareModal: () => setIsShareModalOpen(true),
    onSelectTransactionForDelete: setDeletingTransaction,
    onSelectTransactionForEdit: setEditingTransaction,
    onToggleBudgetChart: () => setIsBudgetChartOpen((previous) => !previous),
    onToggleChart: () => setIsChartOpen((previous) => !previous),
  };
}
