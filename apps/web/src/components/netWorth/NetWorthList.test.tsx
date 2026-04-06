import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { type NetWorthSnapshot } from '../../types/netWorth';
import { NetWorthList } from './NetWorthList';

const makeSnapshot = (
  overrides: Partial<NetWorthSnapshot> & Pick<NetWorthSnapshot, 'title'>
): NetWorthSnapshot => ({
  id: crypto.randomUUID(),
  totalAssets: 10000,
  totalLiabilities: 2000,
  netWorth: 8000,
  entries: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const defaultProps = {
  error: false,
  loading: false,
  onDelete: vi.fn(),
  snapshots: [],
};

const renderList = (props: React.ComponentProps<typeof NetWorthList>) =>
  render(
    <MemoryRouter>
      <NetWorthList {...props} />
    </MemoryRouter>
  );

describe('NetWorthList', () => {
  it('shows a skeleton when loading', () => {
    const { getByTestId } = renderList({ ...defaultProps, loading: true });
    expect(getByTestId('net-worth-list-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when error is true', () => {
    renderList({ ...defaultProps, error: true });
    expect(screen.getByText('Failed to load snapshots.')).toBeInTheDocument();
  });

  it('shows empty state when there are no snapshots', () => {
    renderList(defaultProps);
    expect(screen.getByText('No snapshots yet')).toBeInTheDocument();
  });

  it('renders snapshot titles with links to detail pages', () => {
    const snapshot = makeSnapshot({ id: 'snap-1', title: 'January 2026' });
    renderList({ ...defaultProps, snapshots: [snapshot] });
    const link = screen.getByRole('link', { name: /January 2026/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/net-worth/snap-1');
  });

  it('renders a positive net worth with a + prefix', () => {
    const snapshot = makeSnapshot({ title: 'January 2026', netWorth: 8000 });
    renderList({ ...defaultProps, snapshots: [snapshot] });
    expect(screen.getByText(/^\+/)).toBeInTheDocument();
  });

  it('renders a negative net worth with a - prefix', () => {
    const snapshot = makeSnapshot({ title: 'January 2026', netWorth: -2000 });
    renderList({ ...defaultProps, snapshots: [snapshot] });
    expect(screen.getByText(/^-/)).toBeInTheDocument();
  });

  it('calls onDelete with the snapshot when Delete is clicked', async () => {
    const onDelete = vi.fn();
    const snapshot = makeSnapshot({ title: 'January 2026' });
    renderList({ ...defaultProps, snapshots: [snapshot], onDelete });
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(snapshot);
  });
});
