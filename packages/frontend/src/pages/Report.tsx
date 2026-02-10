import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Input, Modal, Select } from '../components/ui';
import { GET_REPORT } from '../graphql/reports';
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
  const { data, loading, error } = useQuery<ReportData>(GET_REPORT, {
    variables: { id },
  });
  const [createTransaction] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: [{ query: GET_REPORT, variables: { id } }],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {report.title}
          </h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Transaction</Button>
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
    </div>
  );
}
