import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddTransactionModal } from './AddTransactionModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('AddTransactionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AddTransactionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders form fields when open', () => {
    render(<AddTransactionModal {...defaultProps} />);
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('shows expense categories by default', () => {
    render(<AddTransactionModal {...defaultProps} />);
    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Transport' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Salary' })
    ).not.toBeInTheDocument();
  });

  it('shows income categories when Income type is selected', async () => {
    render(<AddTransactionModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Income'));

    expect(screen.getByRole('option', { name: 'Salary' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Freelance' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Food' })
    ).not.toBeInTheDocument();
  });

  it('resets category when switching transaction type', async () => {
    render(<AddTransactionModal {...defaultProps} />);

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Food');
    expect(screen.getByLabelText('Category')).toHaveValue('Food');

    await userEvent.click(screen.getByText('Income'));
    expect(screen.getByLabelText('Category')).toHaveValue('');
  });

  it('disables Add button when required fields are empty', () => {
    render(<AddTransactionModal {...defaultProps} />);
    expect(screen.getByText('Add')).toBeDisabled();
  });

  it('submits form with correct data', async () => {
    const onSubmit = vi.fn();
    render(<AddTransactionModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Amount'), '42.50');
    await userEvent.type(screen.getByLabelText('Description'), 'Groceries');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Food');

    await userEvent.click(screen.getByText('Add'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'EXPENSE',
        amount: 42.5,
        description: 'Groceries',
        category: 'Food',
      })
    );
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<AddTransactionModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
