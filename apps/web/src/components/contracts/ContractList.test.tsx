import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeContract } from '../../test/fixtures/contracts';
import { ContractList } from './ContractList';

const defaultProps = {
  contracts: [],
  error: false,
  loading: false,
  onAdd: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe('ContractList', () => {
  it('shows a skeleton when loading', () => {
    const { getByTestId } = render(<ContractList {...defaultProps} loading />);

    expect(getByTestId('contract-list-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when error is true', () => {
    render(<ContractList {...defaultProps} error />);

    expect(screen.getByText('Failed to load contracts.')).toBeInTheDocument();
  });

  it('shows the empty state when there are no contracts', () => {
    render(<ContractList {...defaultProps} />);

    expect(screen.getByText('No contracts yet.')).toBeInTheDocument();
  });

  it('shows a no-matches state instead of the empty state while searching', () => {
    render(<ContractList {...defaultProps} isSearching />);

    expect(
      screen.getByText('No contracts match your search.')
    ).toBeInTheDocument();
    expect(screen.queryByText('No contracts yet.')).not.toBeInTheDocument();
  });

  it('renders the provider, category and plan for each contract', () => {
    render(
      <ContractList
        {...defaultProps}
        contracts={[
          makeContract({
            provider: 'DEI',
            category: 'Electricity',
            plan: 'MyHome Online',
          }),
        ]}
      />
    );

    expect(screen.getByText('DEI')).toBeInTheDocument();
    expect(screen.getByText('Electricity')).toBeInTheDocument();
    expect(screen.getByText('MyHome Online')).toBeInTheDocument();
  });

  it('marks an expired contract with an Expired badge', () => {
    render(
      <ContractList
        {...defaultProps}
        contracts={[makeContract({ isExpired: true })]}
      />
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('calls onDelete when Delete is selected from the dropdown', async () => {
    const onDelete = vi.fn();
    const contract = makeContract({ id: 'c1' });

    render(
      <ContractList
        {...defaultProps}
        contracts={[contract]}
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledWith(contract);
  });
});
