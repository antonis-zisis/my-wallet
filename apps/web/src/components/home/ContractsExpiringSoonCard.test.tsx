import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ExpiringContract } from '../../hooks/contracts/selectors/computeExpiringSoon';
import { makeContract } from '../../test/fixtures/contracts';
import { ContractsExpiringSoonCard } from './ContractsExpiringSoonCard';

function makeExpiring(
  daysUntilExpiration: number,
  overrides: Partial<ExpiringContract> = {}
): ExpiringContract {
  return {
    ...makeContract(overrides),
    daysUntilExpiration,
    ...overrides,
  };
}

function renderCard(props: Parameters<typeof ContractsExpiringSoonCard>[0]) {
  return render(
    <MemoryRouter>
      <ContractsExpiringSoonCard {...props} />
    </MemoryRouter>
  );
}

describe('ContractsExpiringSoonCard', () => {
  it('renders the empty state when nothing is expiring', () => {
    renderCard({ contracts: [], loading: false });

    expect(screen.getByText('No contracts expiring soon')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Manage contracts' })
    ).toBeInTheDocument();
  });

  it('lists each expiring contract with its countdown', () => {
    renderCard({
      contracts: [
        makeExpiring(5, { id: 'a', provider: 'DEI' }),
        makeExpiring(0, { id: 'b', provider: 'Cosmote' }),
      ],
      loading: false,
    });

    expect(screen.getByText('DEI')).toBeInTheDocument();
    expect(screen.getByText('expires in 5 days')).toBeInTheDocument();
    expect(screen.getByText('Cosmote')).toBeInTheDocument();
    expect(screen.getByText('expires today')).toBeInTheDocument();
  });

  it('shows only the first three and a "+N more" link on overflow', () => {
    renderCard({
      contracts: [
        makeExpiring(1, { id: 'a', provider: 'A' }),
        makeExpiring(2, { id: 'b', provider: 'B' }),
        makeExpiring(3, { id: 'c', provider: 'C' }),
        makeExpiring(4, { id: 'd', provider: 'D' }),
        makeExpiring(5, { id: 'e', provider: 'E' }),
      ],
      loading: false,
    });

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+2 more' })).toBeInTheDocument();
  });
});
