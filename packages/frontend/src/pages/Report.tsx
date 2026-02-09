import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Input, Select, Modal } from '../components/ui';
import {
  Transaction,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../types/transaction';
import { formatDate } from '../utils/formatDate';

const mockReports: Record<
  string,
  { title: string; transactions: Transaction[] }
> = {
  '1': {
    title: 'Monthly Budget Summary',
    transactions: [
      {
        id: '1',
        reportId: '1',
        type: 'EXPENSE',
        amount: 50.0,
        description: 'Groceries',
        category: 'Food',
        date: '2024-01-14',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
      },
      {
        id: '2',
        reportId: '1',
        type: 'INCOME',
        amount: 3000.0,
        description: 'January Salary',
        category: 'Salary',
        date: '2024-01-01',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
      },
      {
        id: '3',
        reportId: '1',
        type: 'EXPENSE',
        amount: 120.0,
        description: 'Electric Bill',
        category: 'Utilities',
        date: '2024-01-10',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
      },
    ],
  },
  '2': {
    title: 'Q4 Expense Analysis',
    transactions: [
      {
        id: '4',
        reportId: '2',
        type: 'EXPENSE',
        amount: 200.0,
        description: 'Holiday Shopping',
        category: 'Shopping',
        date: '2024-01-08',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
      },
    ],
  },
  '3': {
    title: 'Annual Financial Review',
    transactions: [],
  },
};

export function Report() {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>(
    mockReports[id || '']?.transactions || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const reportTitle = mockReports[id || '']?.title || 'Report Not Found';

  const formatAmount = (transaction: Transaction) => {
    const sign = transaction.type === 'INCOME' ? '+' : '-';
    return `${sign}${transaction.amount.toFixed(2)} €`;
  };

  const handleCreateTransaction = () => {
    if (
      !newTransaction.amount ||
      !newTransaction.description ||
      !newTransaction.category
    ) {
      return;
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      reportId: id || '',
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: newTransaction.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions([transaction, ...transactions]);
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
            {reportTitle}
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
