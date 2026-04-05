import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReportHeader } from './ReportHeader';

const defaultProps = {
  createdAt: '2024-01-01T00:00:00.000Z',
  title: 'Test Report',
  updatedAt: '2024-03-15T00:00:00.000Z',
  onAddTransaction: vi.fn(),
  onDeleteReport: vi.fn(),
  onSaveTitle: vi.fn(),
};

const openRenameViaDropdown = async () => {
  await userEvent.click(screen.getByLabelText('Options'));
  await userEvent.click(screen.getByText('Rename Report'));
};

describe('ReportHeader', () => {
  it('displays the report title', () => {
    render(<ReportHeader {...defaultProps} />);
    expect(screen.getByText('Test Report')).toBeInTheDocument();
  });

  it('displays createdAt and updatedAt dates', () => {
    render(<ReportHeader {...defaultProps} />);
    expect(screen.getByText(/Created Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Updated Mar 15, 2024/)).toBeInTheDocument();
  });

  it('enters edit mode when Rename Report is clicked in the dropdown', async () => {
    render(<ReportHeader {...defaultProps} />);
    await openRenameViaDropdown();
    expect(screen.getByDisplayValue('Test Report')).toBeInTheDocument();
  });

  it('saves new title on Enter key', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await openRenameViaDropdown();
    const input = screen.getByDisplayValue('Test Report');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Title{Enter}');

    expect(onSaveTitle).toHaveBeenCalledWith('New Title');
  });

  it('cancels editing on Escape key', async () => {
    render(<ReportHeader {...defaultProps} />);

    await openRenameViaDropdown();
    expect(screen.getByDisplayValue('Test Report')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.getByText('Test Report')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not save when title is unchanged', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await openRenameViaDropdown();
    await userEvent.keyboard('{Enter}');

    expect(onSaveTitle).not.toHaveBeenCalled();
  });

  it('does not save when title is empty', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await openRenameViaDropdown();
    const input = screen.getByDisplayValue('Test Report');
    await userEvent.clear(input);
    await userEvent.keyboard('{Enter}');

    expect(onSaveTitle).not.toHaveBeenCalled();
  });

  it('calls onAddTransaction when Add Transaction is clicked', async () => {
    const onAddTransaction = vi.fn();
    render(
      <ReportHeader {...defaultProps} onAddTransaction={onAddTransaction} />
    );

    await userEvent.click(screen.getByText('Add Transaction'));
    expect(onAddTransaction).toHaveBeenCalled();
  });

  it('calls onDeleteReport via dropdown menu', async () => {
    const onDeleteReport = vi.fn();
    render(<ReportHeader {...defaultProps} onDeleteReport={onDeleteReport} />);

    await userEvent.click(screen.getByLabelText('Options'));
    await userEvent.click(screen.getByText('Delete Report'));
    expect(onDeleteReport).toHaveBeenCalled();
  });
});
