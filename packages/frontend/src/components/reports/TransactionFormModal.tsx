import { useEffect, useState } from 'react';

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionType,
} from '../../types/transaction';
import { Button, Input, Modal, Select } from '../ui';

export interface TransactionFormInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TransactionFormInput) => void;
  mode: 'add' | 'edit';
  transaction?: Transaction;
}

const INITIAL_FORM = {
  type: 'EXPENSE' as TransactionType,
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
};

function formFromTransaction(transaction: Transaction) {
  return {
    type: transaction.type,
    amount: String(transaction.amount),
    description: transaction.description,
    category: transaction.category,
    date: transaction.date.split('T')[0],
  };
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  transaction,
}: TransactionFormModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        mode === 'edit' && transaction
          ? formFromTransaction(transaction)
          : INITIAL_FORM
      );
    }
  }, [isOpen, mode, transaction]);

  const categories =
    form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const isAdd = mode === 'add';
  const title = isAdd ? 'Add Transaction' : 'Edit Transaction';
  const submitLabel = isAdd ? 'Add' : 'Save';

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = () => {
    if (!form.amount || !form.description || !form.category) {
      return;
    }
    onSubmit({
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category,
      date: form.date,
    });
    setForm(INITIAL_FORM);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.amount || !form.description || !form.category}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={form.type === 'INCOME' ? 'success' : 'secondary'}
            className="flex-1"
            onClick={() => setForm({ ...form, type: 'INCOME', category: '' })}
          >
            Income
          </Button>
          <Button
            type="button"
            variant={form.type === 'EXPENSE' ? 'danger' : 'secondary'}
            className="flex-1"
            onClick={() => setForm({ ...form, type: 'EXPENSE', category: '' })}
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
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
        />

        <Input
          label="Description"
          id="description"
          placeholder="Enter description"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />

        <Select
          label="Category"
          id="category"
          placeholder="Select a category"
          value={form.category}
          onChange={(event) =>
            setForm({ ...form, category: event.target.value })
          }
          options={categories.map((cat) => ({ value: cat, label: cat }))}
        />

        <Input
          label="Date"
          id="date"
          type="date"
          value={form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
        />
      </div>
    </Modal>
  );
}
