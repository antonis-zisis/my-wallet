import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const stubs = vi.hoisted(() => ({
  billing: {} as Record<string, unknown>,
  checkout: {} as Record<string, unknown>,
  plan: {} as Record<string, unknown>,
  portal: {} as Record<string, unknown>,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');

  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../hooks/plan/usePlanData', () => ({
  usePlanData: () => stubs.plan,
}));

vi.mock('../hooks/billing/useBillingData', () => ({
  useBillingData: () => stubs.billing,
}));

vi.mock('../hooks/billing/useBillingPortal', () => ({
  useBillingPortal: () => stubs.portal,
}));

vi.mock('../hooks/billing/useCheckoutCompletion', () => ({
  useCheckoutCompletion: () => stubs.checkout,
}));

import { SelectPlan } from './SelectPlan';

const comparison = [
  { label: 'Reports you own', free: '3', pro: 'Unlimited' },
  { label: 'Net worth snapshots', free: '1', pro: 'Unlimited' },
];

const intervalOptions = [
  {
    interval: 'MONTH' as const,
    label: 'Monthly',
    priceLabel: '€4 / month',
    savingsLabel: null,
  },
  {
    interval: 'YEAR' as const,
    label: 'Yearly',
    priceLabel: '€38,40 / year',
    savingsLabel: 'Save 20%',
  },
];

const onSelectPlan = vi.fn();
const onUpgrade = vi.fn();
const onManageBilling = vi.fn();

type Overrides = {
  billing?: Record<string, unknown>;
  checkout?: Record<string, unknown>;
  plan?: Record<string, unknown>;
  route?: string;
};

function renderSelectPlan({
  billing = {},
  checkout = {},
  plan = {},
  route = '/select-plan',
}: Overrides = {}) {
  stubs.plan = {
    comparison,
    currentPlan: null,
    error: false,
    loading: false,
    onSelectPlan,
    selectingPlan: null,
    ...plan,
  };
  stubs.billing = {
    intervalOptions,
    isCheckoutAvailable: true,
    isStartingCheckout: false,
    onUpgrade,
    ...billing,
  };
  stubs.portal = { isOpeningPortal: false, onManageBilling };
  stubs.checkout = { hasTimedOut: false, isFinalizing: false, ...checkout };

  return render(
    <MemoryRouter initialEntries={[route]}>
      <SelectPlan />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
  onSelectPlan.mockReset();
  onSelectPlan.mockResolvedValue(true);
  onUpgrade.mockReset();
  onManageBilling.mockReset();
});

describe('SelectPlan', () => {
  it('shows both plans with their limits and the Pro price', () => {
    renderSelectPlan();

    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByText('€4 / month')).toBeInTheDocument();
    expect(screen.getByText('Free forever')).toBeInTheDocument();
  });

  it('shows a loading state while the plans load', () => {
    renderSelectPlan({ plan: { loading: true } });

    expect(screen.queryByRole('heading', { name: 'Free' })).toBeNull();
  });

  it('shows an error state when the plans fail to load', () => {
    renderSelectPlan({ plan: { error: true } });

    expect(screen.getByText(/could not load the plans/)).toBeInTheDocument();
  });

  it('stores Free and continues into the app', async () => {
    renderSelectPlan();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Free' })
    );

    expect(onSelectPlan).toHaveBeenCalledWith('FREE');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('stays put when storing the plan fails', async () => {
    onSelectPlan.mockResolvedValue(false);
    renderSelectPlan();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Free' })
    );

    await waitFor(() => expect(onSelectPlan).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sends the chosen interval to checkout', async () => {
    renderSelectPlan();

    await userEvent.click(screen.getByRole('button', { name: /Yearly/ }));
    expect(screen.getByText('€38,40 / year')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Pro' })
    );

    expect(onUpgrade).toHaveBeenCalledWith('YEAR');
  });

  it('disables Pro when billing is not configured', () => {
    renderSelectPlan({
      billing: { intervalOptions: [], isCheckoutAvailable: false },
    });

    expect(
      screen.getByRole('button', { name: 'Not available yet' })
    ).toBeDisabled();
    expect(
      screen.queryByRole('group', { name: 'Billing interval' })
    ).toBeNull();
  });

  it('sends a subscriber to the billing portal to cancel', async () => {
    renderSelectPlan({ plan: { currentPlan: 'PRO' } });

    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel in billing portal' })
    );

    expect(onManageBilling).toHaveBeenCalled();
  });

  it('waits for the webhook after checkout instead of showing Free', () => {
    renderSelectPlan({
      checkout: { isFinalizing: true },
      route: '/select-plan?checkout=success',
    });

    expect(screen.getByText(/Finishing up your upgrade/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Free' })).toBeNull();
  });

  it('confirms the upgrade once the webhook has landed', () => {
    renderSelectPlan({
      plan: { currentPlan: 'PRO' },
      route: '/select-plan?checkout=success',
    });

    expect(screen.getByText('You are on Pro')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to the dashboard' })
    ).toBeInTheDocument();
  });

  it('offers another check when the upgrade takes too long', () => {
    renderSelectPlan({
      checkout: { hasTimedOut: true },
      route: '/select-plan?checkout=success',
    });

    expect(
      screen.getByText(/taking a moment to switch on/)
    ).toBeInTheDocument();
  });

  it('says nothing was charged when checkout is abandoned', () => {
    renderSelectPlan({ route: '/select-plan?checkout=cancelled' });

    expect(screen.getByText(/nothing was charged/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
  });
});
