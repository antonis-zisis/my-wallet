import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const planData = vi.hoisted(() => ({
  value: {} as Record<string, unknown>,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');

  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../hooks/plan/usePlanData', () => ({
  usePlanData: () => planData.value,
}));

import { SelectPlan } from './SelectPlan';

const comparison = [
  { label: 'Reports you own', free: '3', pro: 'Unlimited' },
  { label: 'Net worth snapshots', free: '1', pro: 'Unlimited' },
];

const onSelectPlan = vi.fn();

function renderSelectPlan(overrides: Record<string, unknown> = {}) {
  planData.value = {
    comparison,
    currentPlan: null,
    error: false,
    loading: false,
    onSelectPlan,
    selectingPlan: null,
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <SelectPlan />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
  onSelectPlan.mockReset();
  onSelectPlan.mockResolvedValue(true);
});

describe('SelectPlan', () => {
  it('shows both plans with their limits', () => {
    renderSelectPlan();

    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('Unlimited')).toHaveLength(2);
  });

  it('shows a loading state while the plans load', () => {
    renderSelectPlan({ loading: true });

    expect(screen.queryByRole('heading', { name: 'Free' })).toBeNull();
  });

  it('shows an error state when the plans fail to load', () => {
    renderSelectPlan({ error: true });

    expect(screen.getByText(/could not load the plans/)).toBeInTheDocument();
  });

  it('stores the chosen plan and continues into the app', async () => {
    renderSelectPlan();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Free' })
    );

    expect(onSelectPlan).toHaveBeenCalledWith('FREE');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('stays put when the plan change fails', async () => {
    onSelectPlan.mockResolvedValue(false);
    renderSelectPlan();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Pro' })
    );

    await waitFor(() => expect(onSelectPlan).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('marks the plan the user is already on and offers a way back', () => {
    renderSelectPlan({ currentPlan: 'FREE' });

    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Upgrade to Pro' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to the app' })
    ).toBeInTheDocument();
  });
});
