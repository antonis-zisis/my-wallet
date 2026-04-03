import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Transaction } from '../../types/transaction';
import { TransactionFormModal } from './TransactionFormModal';

const mockTransaction: Transaction = {
  id: '1',
  reportId: 'r1',
  type: 'EXPENSE',
  amount: 42.5,
  description: 'Groceries',
  category: 'Food',
  date: String(new Date('2024-03-15').getTime()),
  createdAt: '2024-03-15T00:00:00.000Z',
  updatedAt: '2024-03-15T00:00:00.000Z',
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('TransactionFormModal', () => {
  describe('edit mode', () => {
    it('shows edit title and Save button', () => {
      render(
        <TransactionFormModal
          {...defaultProps}
          mode="edit"
          transaction={mockTransaction}
        />
      );

      expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('pre-populates form fields from transaction', () => {
      render(
        <TransactionFormModal
          {...defaultProps}
          mode="edit"
          transaction={mockTransaction}
        />
      );

      expect(screen.getByLabelText('Amount')).toHaveValue(42.5);
      expect(screen.getByLabelText('Description')).toHaveValue('Groceries');
      expect(screen.getByLabelText('Category')).toHaveValue('Food');
    });

    it('pre-populates date from numeric timestamp string', () => {
      render(
        <TransactionFormModal
          {...defaultProps}
          mode="edit"
          transaction={mockTransaction}
        />
      );

      expect(screen.getByLabelText('Date')).toHaveValue('2024-03-15');
    });

    it('submits edited values', async () => {
      const onSubmit = vi.fn();
      render(
        <TransactionFormModal
          {...defaultProps}
          onSubmit={onSubmit}
          mode="edit"
          transaction={mockTransaction}
        />
      );

      await userEvent.clear(screen.getByLabelText('Description'));
      await userEvent.type(screen.getByLabelText('Description'), 'Updated');
      await userEvent.click(screen.getByText('Save'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'EXPENSE',
          amount: 42.5,
          description: 'Updated',
          category: 'Food',
          date: '2024-03-15',
        })
      );
    });
  });
});
