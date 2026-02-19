import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ExpenseBreakdownChart } from '../components/charts';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import {
  AddTransactionModal,
  CreateTransactionInput,
  DeleteReportModal,
  DeleteTransactionModal,
  ReportHeader,
  ReportSummary,
  TransactionFormModal,
  TransactionTable,
} from '../components/reports';
import { Card } from '../components/ui';
import { DELETE_REPORT, GET_REPORT, UPDATE_REPORT } from '../graphql/reports';
import {
  DELETE_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../graphql/transactions';
import { CREATE_TRANSACTION } from '../graphql/transactions';
import { Report as ReportType } from '../types/report';
import { Transaction } from '../types/transaction';

interface ReportData {
  report: ReportType & { transactions: Transaction[] };
}

export function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<ReportData>(GET_REPORT, {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const report = data?.report;
  const transactions = report?.transactions ?? [];

  const handleSaveTitle = async (title: string) => {
    await updateReport({ variables: { input: { id, title } } });
  };

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    await createTransaction({
      variables: { input: { ...input, reportId: id } },
    });
    setIsModalOpen(false);
  };

  const handleUpdateTransaction = async (input: CreateTransactionInput) => {
    if (!editingTransaction) {
      return;
    }
    await updateTransaction({
      variables: {
        input: { ...input, id: editingTransaction.id },
      },
    });
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) {
      return;
    }
    await deleteTransaction({
      variables: { id: deletingTransaction.id },
    });
    setDeletingTransaction(null);
  };

  const handleDeleteReport = async () => {
    await deleteReport({ variables: { id } });
    navigate('/reports');
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6">
            <Link
              to="/reports"
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Reports
            </Link>
          </div>
          <p className="text-center text-red-500">
            {error ? 'Failed to load report.' : 'Report not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6">
          <Link
            to="/reports"
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Reports
          </Link>
        </div>

        <ReportHeader
          title={report.title}
          onSaveTitle={handleSaveTitle}
          onAddTransaction={() => setIsModalOpen(true)}
          onDeleteReport={() => setIsDeleteModalOpen(true)}
        />

        <ReportSummary transactions={transactions} />

        <Card className="mt-4">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => setIsChartOpen((prev) => !prev)}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Expense Breakdown
            </h2>

            {isChartOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {isChartOpen && (
            <div className="mt-2">
              <ExpenseBreakdownChart transactions={transactions} />
            </div>
          )}
        </Card>

        <div className="mt-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <TransactionTable
            transactions={transactions}
            onEdit={setEditingTransaction}
            onDelete={setDeletingTransaction}
          />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />

      <TransactionFormModal
        isOpen={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleUpdateTransaction}
        mode="edit"
        transaction={editingTransaction ?? undefined}
      />

      <DeleteTransactionModal
        isOpen={deletingTransaction !== null}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteTransaction}
        transactionDescription={deletingTransaction?.description ?? ''}
        isDeleting={isDeletingTransaction}
      />

      <DeleteReportModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteReport}
        reportTitle={report.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
