import { useState } from 'react';

import { Transaction } from '../types/transaction';

export function useReportModals() {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isBudgetChartOpen, setIsBudgetChartOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
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
    onCloseAddTransactionModal: () => setIsAddTransactionModalOpen(false),
    onCloseDeleteReportModal: () => setIsDeleteReportModalOpen(false),
    onCloseDeleteTransactionModal: () => setDeletingTransaction(null),
    onCloseEditTransactionModal: () => setEditingTransaction(null),
    onOpenAddTransactionModal: () => setIsAddTransactionModalOpen(true),
    onOpenDeleteReportModal: () => setIsDeleteReportModalOpen(true),
    onSelectTransactionForDelete: setDeletingTransaction,
    onSelectTransactionForEdit: setEditingTransaction,
    onToggleBudgetChart: () => setIsBudgetChartOpen((previous) => !previous),
    onToggleChart: () => setIsChartOpen((previous) => !previous),
  };
}
