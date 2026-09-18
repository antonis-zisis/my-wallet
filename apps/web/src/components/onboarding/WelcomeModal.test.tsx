import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WelcomeModal } from './WelcomeModal';

function renderModal(overrides: { initialFullName?: string } = {}) {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  render(
    <WelcomeModal
      initialCurrency="EUR"
      initialFullName={overrides.initialFullName ?? ''}
      isOpen
      isSaving={false}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );

  return { onClose, onSubmit };
}

async function goToStep(index: number) {
  for (let step = 0; step < index; step += 1) {
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  }
}

describe('WelcomeModal', () => {
  it('opens on the tour of what the app tracks', () => {
    renderModal();

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Net Worth')).toBeInTheDocument();
  });

  it('asks for a name and a currency on the second step', async () => {
    renderModal();

    await goToStep(1);

    expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveValue('EUR');
  });

  it('says the currency does not convert existing amounts', async () => {
    renderModal();

    await goToStep(1);

    expect(
      screen.getByText(/does not convert existing amounts/)
    ).toBeInTheDocument();
  });

  it('can step back to a previous screen', async () => {
    renderModal();

    await goToStep(1);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
  });

  it('submits the details the user entered', async () => {
    const { onSubmit } = renderModal();

    await goToStep(1);
    await userEvent.type(screen.getByLabelText('Your name'), 'Ada Lovelace');
    await userEvent.selectOptions(screen.getByLabelText('Currency'), 'GBP');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Get started' }));

    expect(onSubmit).toHaveBeenCalledWith({
      currency: 'GBP',
      fullName: 'Ada Lovelace',
    });
  });

  it('closes without saving when dismissed', async () => {
    const { onClose, onSubmit } = renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
