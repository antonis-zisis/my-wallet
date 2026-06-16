import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '../../contexts/ToastContext';
import {
  DELETE_REPORT,
  GET_REPORT,
  LOCK_REPORT,
  UNLOCK_REPORT,
  UPDATE_REPORT,
} from '../../graphql/reports';
import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../../graphql/transactions';
import { Report as ReportType } from '../../types/report';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionFormInput,
} from '../../types/transaction';
import { exportReportToCsv } from '../../utils/exportReportToCsv';
import {
  getFilteredTransactions,
  TypeFilter,
} from './selectors/getFilteredTransactions';
import { getPresentCategories } from './selectors/getPresentCategories';
import { useReportModals } from './useReportModals';

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

  const modals = useReportModals();

  const [selectedTypeFilter, setSelectedTypeFilter] =
    useState<TypeFilter>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('All');

  const onSelectTypeFilter = (type: TypeFilter) => {
    setSelectedTypeFilter(type);
    setSelectedCategoryFilter('All');
  };

  const report = data?.report;
  const transactions = report?.transactions ?? [];
  const isLocked = report?.isLocked ?? false;

  const presentExpenseCategories = getPresentCategories(
    EXPENSE_CATEGORIES,
    transactions,
    'EXPENSE'
  );
  const presentIncomeCategories = getPresentCategories(
    INCOME_CATEGORIES,
    transactions,
    'INCOME'
  );

  const filteredTransactions = getFilteredTransactions(
    transactions,
    selectedTypeFilter,
    selectedCategoryFilter
  );

  const onSaveTitle = async (title: string) => {
    await updateReport({ variables: { input: { id, title } } });
  };

  const onCreateTransaction = async (input: TransactionFormInput) => {
    try {
      await createTransaction({
        variables: { input: { ...input, reportId: id } },
      });

      modals.onCloseAddTransactionModal();
      showSuccess('Transaction added.');
    } catch {
      showError('Failed to add transaction.');
    }
  };

  const onUpdateTransaction = async (input: TransactionFormInput) => {
    if (!modals.editingTransaction) {
      return;
    }

    await updateTransaction({
      variables: { input: { ...input, id: modals.editingTransaction.id } },
    });

    modals.onCloseEditTransactionModal();
  };

  const onConfirmDeleteTransaction = async () => {
    if (!modals.deletingTransaction) {
      return;
    }

    await deleteTransaction({
      variables: { id: modals.deletingTransaction.id },
    });

    modals.onCloseDeleteTransactionModal();
  };

  const onConfirmDeleteReport = async () => {
    await deleteReport({ variables: { id } });
    navigate('/reports');
  };

  const onExportCsv = () => {
    if (report) {
      exportReportToCsv(report.title, transactions);
    }
  };

  return {
    ...modals,
    error: !!error,
    filteredTransactions,
    isDeleting,
    isDeletingTransaction,
    isLocked,
    isLocking,
    loading,
    onConfirmDeleteReport,
    onConfirmDeleteTransaction,
    onCreateTransaction,
    onExportCsv,
    onLockReport: () => lockReport({ variables: { id } }),
    onSaveTitle,
    onSelectCategoryFilter: setSelectedCategoryFilter,
    onSelectTypeFilter,
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
