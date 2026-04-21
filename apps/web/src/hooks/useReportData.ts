import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CreateTransactionInput } from '../components/reports/AddTransactionModal';
import { useToast } from '../contexts/ToastContext';
import {
  DELETE_REPORT,
  GET_REPORT,
  LOCK_REPORT,
  UNLOCK_REPORT,
  UPDATE_REPORT,
} from '../graphql/reports';
import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../graphql/transactions';
import { Report as ReportType } from '../types/report';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
} from '../types/transaction';

interface ReportData {
  report: ReportType & { transactions: Array<Transaction> };
}

export function useReportData() {
  const { showError, showSuccess } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, error, loading } = useQuery<ReportData>(GET_REPORT, {
    variables: { id },
  });

  const [createTransaction] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [deleteTransaction, { loading: isDeletingTransaction }] = useMutation(
    DELETE_TRANSACTION,
    {
      refetchQueries: [{ query: GET_REPORT, variables: { id } }],
    }
  );

  const [updateReport] = useMutation(UPDATE_REPORT, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [deleteReport, { loading: isDeleting }] = useMutation(DELETE_REPORT);

  const [lockReport, { loading: isLocking }] = useMutation(LOCK_REPORT, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [unlockReport] = useMutation(UNLOCK_REPORT, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isBudgetChartOpen, setIsBudgetChartOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    'All' | 'Income' | 'Expense'
  >('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('All');

  const onSelectTypeFilter = (type: 'All' | 'Income' | 'Expense') => {
    setSelectedTypeFilter(type);
    setSelectedCategoryFilter('All');
  };

  const report = data?.report;
  const transactions = report?.transactions ?? [];
  const isLocked = report?.isLocked ?? false;

  const presentExpenseCategories = EXPENSE_CATEGORIES.filter((category) =>
    transactions.some(
      (transaction) =>
        transaction.category === category && transaction.type === 'EXPENSE'
    )
  );

  const presentIncomeCategories = INCOME_CATEGORIES.filter((category) =>
    transactions.some(
      (transaction) =>
        transaction.category === category && transaction.type === 'INCOME'
    )
  );

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      selectedTypeFilter === 'All' ||
      (selectedTypeFilter === 'Income' && transaction.type === 'INCOME') ||
      (selectedTypeFilter === 'Expense' && transaction.type === 'EXPENSE');

    const matchesCategory =
      selectedCategoryFilter === 'All' ||
      transaction.category === selectedCategoryFilter;

    return matchesType && matchesCategory;
  });

  const onSaveTitle = async (title: string) => {
    await updateReport({ variables: { input: { id, title } } });
  };

  const onCreateTransaction = async (input: CreateTransactionInput) => {
    try {
      await createTransaction({
        variables: { input: { ...input, reportId: id } },
      });

      setIsAddTransactionModalOpen(false);
      showSuccess('Transaction added.');
    } catch {
      showError('Failed to add transaction.');
    }
  };

  const onUpdateTransaction = async (input: CreateTransactionInput) => {
    if (!editingTransaction) {
      return;
    }

    await updateTransaction({
      variables: { input: { ...input, id: editingTransaction.id } },
    });

    setEditingTransaction(null);
  };

  const onConfirmDeleteTransaction = async () => {
    if (!deletingTransaction) {
      return;
    }

    await deleteTransaction({ variables: { id: deletingTransaction.id } });

    setDeletingTransaction(null);
  };

  const onConfirmDeleteReport = async () => {
    await deleteReport({ variables: { id } });
    navigate('/reports');
  };

  return {
    deletingTransaction,
    editingTransaction,
    error: !!error,
    filteredTransactions,
    isAddTransactionModalOpen,
    isBudgetChartOpen,
    isChartOpen,
    isDeleteReportModalOpen,
    isDeleting,
    isDeletingTransaction,
    isLocked,
    isLocking,
    loading,
    onCloseAddTransactionModal: () => setIsAddTransactionModalOpen(false),
    onCloseDeleteReportModal: () => setIsDeleteReportModalOpen(false),
    onCloseDeleteTransactionModal: () => setDeletingTransaction(null),
    onCloseEditTransactionModal: () => setEditingTransaction(null),
    onConfirmDeleteReport,
    onConfirmDeleteTransaction,
    onCreateTransaction,
    onLockReport: () => lockReport({ variables: { id } }),
    onOpenAddTransactionModal: () => setIsAddTransactionModalOpen(true),
    onOpenDeleteReportModal: () => setIsDeleteReportModalOpen(true),
    onSaveTitle,
    onSelectCategoryFilter: setSelectedCategoryFilter,
    onSelectTransactionForDelete: setDeletingTransaction,
    onSelectTransactionForEdit: setEditingTransaction,
    onSelectTypeFilter,
    onToggleBudgetChart: () => setIsBudgetChartOpen((prev) => !prev),
    onToggleChart: () => setIsChartOpen((prev) => !prev),
    onUnlockReport: () => unlockReport({ variables: { id } }),
    onUpdateTransaction,
    presentExpenseCategories,
    presentIncomeCategories,
    report,
    selectedCategoryFilter,
    selectedTypeFilter,
    transactions,
  };
}
