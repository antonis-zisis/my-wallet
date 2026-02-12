import { useState } from 'react';

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TransactionType,
} from '../../types/transaction';
import { Button, Input, Modal, Select } from '../ui';

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => void;
}

const INITIAL_FORM = {
  type: 'EXPENSE' as TransactionType,
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
};

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  const categories =
    form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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
      title="Add Transaction"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.amount || !form.description || !form.category}
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
