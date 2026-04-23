import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EntryInput, NetWorthSnapshotModal } from './NetWorthSnapshotModal';

type ModalProps = ComponentProps<typeof NetWorthSnapshotModal>;

const baseProps: ModalProps = {
  isOpen: true,
  modalTitle: 'New Net Worth Snapshot',
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
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
    const titleInput = screen.getByPlaceholderText('e.g. February 2026');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'January 2026');
    expect(
      screen.getByRole('button', { name: 'Save Snapshot' })
    ).toBeDisabled();
  });

  it('enables the submit button when title and one entry are filled', async () => {
    renderModal();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. Savings Account'),
      'Savings'
    );
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1000');
    expect(screen.getByRole('button', { name: 'Save Snapshot' })).toBeEnabled();
  });

  it('adds a new asset entry when the Assets + Add button is clicked', async () => {
    renderModal();
    const addButtons = screen.getAllByRole('button', { name: '+ Add' });
    await userEvent.click(addButtons[0]);
    expect(screen.getAllByPlaceholderText('e.g. Savings Account')).toHaveLength(
      2
    );
  });

  it('removes an entry when the remove button is clicked', async () => {
    renderModal();
    const addButtons = screen.getAllByRole('button', { name: '+ Add' });
    await userEvent.click(addButtons[0]);
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove entry',
    });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText('e.g. Savings Account')).toHaveLength(
      1
    );
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

  it('renders a Snapshot Date input with a non-empty default value', () => {
    renderModal();
    const dateInput = screen.getByLabelText('Snapshot Date');
    expect(dateInput).toBeInTheDocument();
    expect((dateInput as HTMLInputElement).value).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it("auto-populates the title from today's date when no initialTitle is provided", () => {
    renderModal();
    const titleInput = screen.getByPlaceholderText(
      'e.g. February 2026'
    ) as HTMLInputElement;
    expect(titleInput.value).toMatch(/^\w+ \d{4}$/);
  });

  it('updates the title when the date changes and the title was not manually edited', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Snapshot Date'), {
      target: { value: '2026-01-15' },
    });
    expect(screen.getByPlaceholderText('e.g. February 2026')).toHaveValue(
      'January 2026'
    );
  });

  it('does not update the title when the date changes after a manual edit', async () => {
    renderModal();
    const titleInput = screen.getByPlaceholderText('e.g. February 2026');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'My Custom Title');
    fireEvent.change(screen.getByLabelText('Snapshot Date'), {
      target: { value: '2026-01-15' },
    });
    expect(titleInput).toHaveValue('My Custom Title');
  });

  it('submits the snapshotDate from the date input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    fireEvent.change(screen.getByLabelText('Snapshot Date'), {
      target: { value: '2026-03-01' },
    });
    await userEvent.type(
      screen.getByPlaceholderText('e.g. Savings Account'),
      'Savings'
    );
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ snapshotDate: '2026-03-01' })
    );
  });

  it('submits trimmed title and entry data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    const titleInput = screen.getByPlaceholderText('e.g. February 2026');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '  January 2026  ');
    await userEvent.type(
      screen.getByPlaceholderText('e.g. Savings Account'),
      'Savings'
    );
    await userEvent.type(screen.getByPlaceholderText('0.00'), '5000');

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'January 2026',
        entries: [
          {
            type: 'ASSET',
            label: 'Savings',
            amount: 5000,
            category: 'Savings',
          },
        ],
      })
    );
  });

  it('disables Cancel and the submit button while saving', async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi
      .fn()
      .mockReturnValue(
        new Promise<void>((resolve) => (resolveSubmit = resolve))
      );
    renderModal({ onSubmit });

    await userEvent.type(
      screen.getByPlaceholderText('e.g. Savings Account'),
      'Savings'
    );
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1000');

    const clickPromise = userEvent.click(
      screen.getByRole('button', { name: 'Save Snapshot' })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    );

    resolveSubmit();
    await clickPromise;

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    );
  });

  it('shows a validation hint when an entry is partially filled', async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1000');
    expect(screen.getByText(/all entries need a label/i)).toBeInTheDocument();
  });

  it('hides totals until an amount is entered', async () => {
    renderModal();
    expect(screen.queryByText(/assets:/i)).not.toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('0.00'), '500');
    expect(screen.getByText(/assets:/i)).toBeInTheDocument();
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

    it('pre-fills the snapshotDate when initialSnapshotDate is provided', () => {
      renderModal({
        initialSnapshotDate: '2026-02-01',
        initialTitle: 'February 2026',
      });
      expect(screen.getByLabelText('Snapshot Date')).toHaveValue('2026-02-01');
    });

    it('prefills the title and entries when provided', () => {
      renderModal({
        initialEntries,
        initialTitle: 'February 2026',
      });

      expect(screen.getByPlaceholderText('e.g. February 2026')).toHaveValue(
        'February 2026'
      );

      const labels = screen.getAllByPlaceholderText('e.g. Savings Account');
      expect(labels).toHaveLength(2);
      expect(labels[0]).toHaveValue('Savings Account');
      expect(labels[1]).toHaveValue('Car Loan');

      const amounts = screen.getAllByPlaceholderText('0.00');
      expect(amounts[0]).toHaveValue(12000);
      expect(amounts[1]).toHaveValue(5000);
    });

    it("auto-generates the title from today's date when only entries are prefilled (duplicate flow)", () => {
      renderModal({ initialEntries });
      const titleInput = screen.getByPlaceholderText(
        'e.g. February 2026'
      ) as HTMLInputElement;
      expect(titleInput.value).toMatch(/^\w+ \d{4}$/);
      expect(
        screen.getAllByPlaceholderText('e.g. Savings Account')
      ).toHaveLength(2);
    });

    it('submits updated values preserving the prefilled entries', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderModal({
        initialEntries,
        initialTitle: 'February 2026',
        onSubmit,
        submitLabel: 'Update Snapshot',
      });

      const amounts = screen.getAllByPlaceholderText('0.00');
      await userEvent.clear(amounts[0]);
      await userEvent.type(amounts[0], '15000');

      await userEvent.click(
        screen.getByRole('button', { name: 'Update Snapshot' })
      );

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
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
        })
      );
    });
  });
});
