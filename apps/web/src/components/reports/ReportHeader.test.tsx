import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReportHeader } from './ReportHeader';

const defaultProps = {
  title: 'Test Report',
  onSaveTitle: vi.fn(),
  onAddTransaction: vi.fn(),
  onDeleteReport: vi.fn(),
};

describe('ReportHeader', () => {
  it('displays the report title', () => {
    render(<ReportHeader {...defaultProps} />);
    expect(screen.getByText('Test Report')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<ReportHeader {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Edit title'));
    expect(screen.getByDisplayValue('Test Report')).toBeInTheDocument();
  });

  it('saves new title on Enter key', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await userEvent.click(screen.getByLabelText('Edit title'));
    const input = screen.getByDisplayValue('Test Report');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Title{Enter}');

    expect(onSaveTitle).toHaveBeenCalledWith('New Title');
  });

  it('cancels editing on Escape key', async () => {
    render(<ReportHeader {...defaultProps} />);

    await userEvent.click(screen.getByLabelText('Edit title'));
    expect(screen.getByDisplayValue('Test Report')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.getByText('Test Report')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not save when title is unchanged', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await userEvent.click(screen.getByLabelText('Edit title'));
    await userEvent.keyboard('{Enter}');

    expect(onSaveTitle).not.toHaveBeenCalled();
  });

  it('does not save when title is empty', async () => {
    const onSaveTitle = vi.fn();
    render(<ReportHeader {...defaultProps} onSaveTitle={onSaveTitle} />);

    await userEvent.click(screen.getByLabelText('Edit title'));
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
