import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  AddTransactionModal,
  CreateTransactionInput,
  DeleteReportModal,
  ReportHeader,
  TransactionTable,
} from '../components/reports';
import { DELETE_REPORT, GET_REPORT, UPDATE_REPORT } from '../graphql/reports';
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
  const [updateReport] = useMutation(UPDATE_REPORT, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });
  const [deleteReport, { loading: isDeleting }] = useMutation(DELETE_REPORT);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <TransactionTable transactions={transactions} />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
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
