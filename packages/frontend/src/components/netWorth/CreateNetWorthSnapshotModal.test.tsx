import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CreateNetWorthSnapshotModal } from './CreateNetWorthSnapshotModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('CreateNetWorthSnapshotModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CreateNetWorthSnapshotModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal title when open', () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    expect(screen.getByText('New Net Worth Snapshot')).toBeInTheDocument();
  });

  it('renders snapshot title input', () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('e.g. February 2026')
    ).toBeInTheDocument();
  });

  it('renders one entry row by default', () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(1);
  });

  it('Save Snapshot button is disabled when form is empty', () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('Save Snapshot button is disabled when only title is filled', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('Save Snapshot button is disabled when only entry is filled but not title', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('enables Save Snapshot button when title and entry are filled', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');
    expect(screen.getByRole('button', { name: 'Save Snapshot' })).toBeEnabled();
  });

  it('adds a new asset entry when + Asset is clicked', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Asset' }));
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(2);
  });

  it('adds a new liability entry when + Liability is clicked', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Liability' }));
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(2);
  });

  it('removes an entry when remove button is clicked', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Asset' }));
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove entry',
    });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(1);
  });

  it('disables remove button when only one entry remains', () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);
    const removeButton = screen.getByRole('button', { name: 'Remove entry' });
    expect(removeButton).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateNetWorthSnapshotModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits correct data and calls onSubmit', async () => {
    const onSubmit = vi.fn();
    render(
      <CreateNetWorthSnapshotModal {...defaultProps} onSubmit={onSubmit} />
    );

    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '5000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'January 2026',
      entries: [
        {
          type: 'ASSET',
          label: 'Savings',
          amount: 5000,
          category: 'Savings',
        },
      ],
    });
  });

  it('submits trimmed title', async () => {
    const onSubmit = vi.fn();
    render(
      <CreateNetWorthSnapshotModal {...defaultProps} onSubmit={onSubmit} />
    );

    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      '  January 2026  '
    );
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'January 2026' })
    );
  });

  it('resets form after successful submission', async () => {
    const onSubmit = vi.fn();
    render(
      <CreateNetWorthSnapshotModal {...defaultProps} onSubmit={onSubmit} />
    );

    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(screen.getByPlaceholderText('e.g. February 2026')).toHaveValue('');
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(1);
    expect(screen.getByPlaceholderText('Label')).toHaveValue('');
  });

  it('shows live totals for assets and liabilities', async () => {
    render(<CreateNetWorthSnapshotModal {...defaultProps} />);

    await userEvent.type(screen.getByPlaceholderText('Amount'), '3000');

    expect(screen.getByText(/Assets:/)).toBeInTheDocument();
    expect(screen.getByText(/Liabilities:/)).toBeInTheDocument();
    expect(screen.getByText(/Net Worth:/)).toBeInTheDocument();
  });

  it('submits multiple entries of different types', async () => {
    const onSubmit = vi.fn();
    render(
      <CreateNetWorthSnapshotModal {...defaultProps} onSubmit={onSubmit} />
    );

    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'Jan 2026'
    );

    // Fill first entry (Asset)
    const labels = screen.getAllByPlaceholderText('Label');
    const amounts = screen.getAllByPlaceholderText('Amount');
    await userEvent.type(labels[0], 'Savings');
    await userEvent.type(amounts[0], '10000');

    // Add a Liability
    await userEvent.click(screen.getByRole('button', { name: '+ Liability' }));
    const labelsAfter = screen.getAllByPlaceholderText('Label');
    const amountsAfter = screen.getAllByPlaceholderText('Amount');
    await userEvent.type(labelsAfter[1], 'Car Loan');
    await userEvent.type(amountsAfter[1], '3000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Jan 2026',
      entries: [
        { type: 'ASSET', label: 'Savings', amount: 10000, category: 'Savings' },
        {
          type: 'LIABILITY',
          label: 'Car Loan',
          amount: 3000,
          category: 'Mortgage',
        },
      ],
    });
  });
});
