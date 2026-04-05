import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CreateTransactionInput } from '../components/reports';
import { DELETE_REPORT, GET_REPORT, UPDATE_REPORT } from '../graphql/reports';
import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../graphql/transactions';
import { Report as ReportType } from '../types/report';
import { Transaction } from '../types/transaction';

interface ReportData {
  report: ReportType & { transactions: Array<Transaction> };
}

export function useReportData() {
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

  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isBudgetChartOpen, setIsBudgetChartOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const report = data?.report;
  const transactions = report?.transactions ?? [];

  const onSaveTitle = async (title: string) => {
    await updateReport({ variables: { input: { id, title } } });
  };

  const onCreateTransaction = async (input: CreateTransactionInput) => {
    await createTransaction({
      variables: { input: { ...input, reportId: id } },
    });

    setIsAddTransactionModalOpen(false);
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
    isBudgetChartOpen,
    isAddTransactionModalOpen,
    isChartOpen,
    isDeleteReportModalOpen,
    isDeleting,
    isDeletingTransaction,
    loading,
    onCloseAddTransactionModal: () => setIsAddTransactionModalOpen(false),
    onCloseDeleteReportModal: () => setIsDeleteReportModalOpen(false),
    onCloseDeleteTransactionModal: () => setDeletingTransaction(null),
    onCloseEditTransactionModal: () => setEditingTransaction(null),
    onConfirmDeleteReport,
    onConfirmDeleteTransaction,
    onCreateTransaction,
    onOpenAddTransactionModal: () => setIsAddTransactionModalOpen(true),
    onOpenDeleteReportModal: () => setIsDeleteReportModalOpen(true),
    onSaveTitle,
    onSelectTransactionForDelete: setDeletingTransaction,
    onSelectTransactionForEdit: setEditingTransaction,
    onToggleBudgetChart: () => setIsBudgetChartOpen((prev) => !prev),
    onToggleChart: () => setIsChartOpen((prev) => !prev),
    onUpdateTransaction,
    report,
    transactions,
  };
}
