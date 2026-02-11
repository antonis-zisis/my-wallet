import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge, Button, Input, Modal, Select } from '../components/ui';
import { DELETE_REPORT, GET_REPORT, UPDATE_REPORT } from '../graphql/reports';
import { CREATE_TRANSACTION } from '../graphql/transactions';
import { Report as ReportType } from '../types/report';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
} from '../types/transaction';
import { formatDate } from '../utils/formatDate';

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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const report = data?.report;
  const transactions = report?.transactions ?? [];

  const formatAmount = (transaction: Transaction) => {
    const sign = transaction.type === 'INCOME' ? '+' : '-';
    return `${sign}${transaction.amount.toFixed(2)} €`;
  };

  const handleCreateTransaction = async () => {
    if (
      !newTransaction.amount ||
      !newTransaction.description ||
      !newTransaction.category
    ) {
      return;
    }

    await createTransaction({
      variables: {
        input: {
          reportId: id,
          type: newTransaction.type,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description,
          category: newTransaction.category,
          date: newTransaction.date,
        },
      },
    });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTransaction({
      type: 'EXPENSE',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleStartEditing = () => {
    setEditTitle(report?.title ?? '');
    setIsEditingTitle(true);
  };

  const handleCancelEditing = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleSaveTitle = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === report?.title) {
      handleCancelEditing();
      return;
    }
    await updateReport({ variables: { input: { id, title: trimmed } } });
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveTitle();
    } else if (event.key === 'Escape') {
      handleCancelEditing();
    }
  };

  const handleDeleteReport = async () => {
    await deleteReport({ variables: { id } });
    navigate('/reports');
  };

  const categories =
    newTransaction.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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

        <div className="mb-6 flex items-center justify-between">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleCancelEditing}
                autoFocus
              />
              <Button
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSaveTitle}
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {report.title}
              </h1>
              <button
                onClick={handleStartEditing}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Edit title"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              Add Transaction
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Report
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No transactions yet. Add your first one!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="pr-4 pb-3">Date</th>
                    <th className="pr-4 pb-3">Type</th>
                    <th className="pr-4 pb-3">Category</th>
                    <th className="pr-4 pb-3">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        index % 2 === 0
                          ? 'bg-gray-50 dark:bg-gray-900'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <td className="py-3 pr-4 pl-1 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            transaction.type === 'INCOME' ? 'success' : 'danger'
                          }
                        >
                          {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                        </Badge>
                      </td>

                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">
                        {transaction.category}
                      </td>

                      <td className="py-3 pr-4 text-sm text-gray-800 dark:text-gray-200">
                        {transaction.description}
                      </td>

                      <td
                        className={`py-3 pr-1 text-right text-sm font-medium ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatAmount(transaction)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTransaction}
              disabled={
                !newTransaction.amount ||
                !newTransaction.description ||
                !newTransaction.category
              }
            >
              Add
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={
                newTransaction.type === 'INCOME' ? 'success' : 'secondary'
              }
              className="flex-1"
              onClick={() =>
                setNewTransaction({
                  ...newTransaction,
                  type: 'INCOME',
                  category: '',
                })
              }
            >
              Income
            </Button>
            <Button
              type="button"
              variant={
                newTransaction.type === 'EXPENSE' ? 'danger' : 'secondary'
              }
              className="flex-1"
              onClick={() =>
                setNewTransaction({
                  ...newTransaction,
                  type: 'EXPENSE',
                  category: '',
                })
              }
            >
              Expense
            </Button>
          </div>

          <Input
            label="Amount"
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={newTransaction.amount}
            onChange={(event) =>
              setNewTransaction({
                ...newTransaction,
                amount: event.target.value,
              })
            }
          />

          <Input
            label="Description"
            id="description"
            placeholder="Enter description"
            value={newTransaction.description}
            onChange={(event) =>
              setNewTransaction({
                ...newTransaction,
                description: event.target.value,
              })
            }
          />

          <Select
            label="Category"
            id="category"
            placeholder="Select a category"
            value={newTransaction.category}
            onChange={(event) =>
              setNewTransaction({
                ...newTransaction,
                category: event.target.value,
              })
            }
            options={categories.map((cat) => ({ value: cat, label: cat }))}
          />

          <Input
            label="Date"
            id="date"
            type="date"
            value={newTransaction.date}
            onChange={(event) =>
              setNewTransaction({ ...newTransaction, date: event.target.value })
            }
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Report"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteReport}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{report.title}</span>? All
          transactions in this report will be permanently deleted.
        </p>
      </Modal>
    </div>
  );
}
