import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EntryInput, NetWorthSnapshotModal } from './NetWorthSnapshotModal';

type ModalProps = ComponentProps<typeof NetWorthSnapshotModal>;

const baseProps: ModalProps = {
  isOpen: true,
  modalTitle: 'New Net Worth Snapshot',
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  submitLabel: 'Save Snapshot',
};

const renderModal = (overrides: Partial<ModalProps> = {}) =>
  render(<NetWorthSnapshotModal {...baseProps} {...overrides} />);

describe('NetWorthSnapshotModal', () => {
  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the provided modal title', () => {
    renderModal({ modalTitle: 'Edit Snapshot' });
    expect(screen.getByText('Edit Snapshot')).toBeInTheDocument();
  });

  it('renders the provided submit button label', () => {
    renderModal({ submitLabel: 'Update Snapshot' });
    expect(
      screen.getByRole('button', { name: 'Update Snapshot' })
    ).toBeInTheDocument();
  });

  it('submit button is disabled when form is empty', () => {
    renderModal();
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('submit button is disabled when only title is filled', async () => {
    renderModal();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('enables the submit button when title and one entry are filled', async () => {
    renderModal();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      'January 2026'
    );
    await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
    await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');
    expect(screen.getByRole('button', { name: 'Save Snapshot' })).toBeEnabled();
  });

  it('adds a new asset entry when + Asset is clicked', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: '+ Asset' }));
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(2);
  });

  it('removes an entry when the remove button is clicked', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: '+ Asset' }));
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove entry',
    });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText('Label')).toHaveLength(1);
  });

  it('disables the remove button when only one entry remains', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Remove entry' })).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits trimmed title and entry data', async () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });

    await userEvent.type(
      screen.getByPlaceholderText('e.g. February 2026'),
      '  January 2026  '
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

  describe('with initial values (duplicate / edit)', () => {
    const initialEntries: Array<EntryInput> = [
      {
        type: 'ASSET',
        label: 'Savings Account',
        amount: 12000,
        category: 'Savings',
      },
      {
        type: 'LIABILITY',
        label: 'Car Loan',
        amount: 5000,
        category: 'Car Loan',
      },
    ];

    it('prefills the title and entries when provided', () => {
      renderModal({
        initialEntries,
        initialTitle: 'February 2026',
      });

      expect(screen.getByPlaceholderText('e.g. February 2026')).toHaveValue(
        'February 2026'
      );

      const labels = screen.getAllByPlaceholderText('Label');
      expect(labels).toHaveLength(2);
      expect(labels[0]).toHaveValue('Savings Account');
      expect(labels[1]).toHaveValue('Car Loan');

      const amounts = screen.getAllByPlaceholderText('Amount');
      expect(amounts[0]).toHaveValue(12000);
      expect(amounts[1]).toHaveValue(5000);
    });

    it('leaves the title blank when only entries are prefilled (duplicate flow)', () => {
      renderModal({ initialEntries });
      expect(screen.getByPlaceholderText('e.g. February 2026')).toHaveValue('');
      expect(screen.getAllByPlaceholderText('Label')).toHaveLength(2);
    });

    it('submits updated values preserving the prefilled entries', async () => {
      const onSubmit = vi.fn();
      renderModal({
        initialEntries,
        initialTitle: 'February 2026',
        onSubmit,
        submitLabel: 'Update Snapshot',
      });

      const amounts = screen.getAllByPlaceholderText('Amount');
      await userEvent.clear(amounts[0]);
      await userEvent.type(amounts[0], '15000');

      await userEvent.click(
        screen.getByRole('button', { name: 'Update Snapshot' })
      );

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'February 2026',
        entries: [
          {
            type: 'ASSET',
            label: 'Savings Account',
            amount: 15000,
            category: 'Savings',
          },
          {
            type: 'LIABILITY',
            label: 'Car Loan',
            amount: 5000,
            category: 'Car Loan',
          },
        ],
      });
    });
  });
});
