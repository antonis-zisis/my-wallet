import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const planState = vi.hoisted(() => ({
  usage: null as unknown,
  user: null as unknown,
}));

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    user: planState.user,
    loading: false,
    updateUser: vi.fn(),
  }),
}));

vi.mock('../../hooks/plan/usePlanUsage', () => ({
  usePlanUsage: () => ({ usage: planState.usage }),
}));

import { FREE_ENTITLEMENTS, makeUser } from '../../test/fixtures';
import { PlanUsageHint } from './PlanUsageHint';

function renderHint() {
  return render(
    <MemoryRouter>
      <PlanUsageHint limit="maxReports" />
    </MemoryRouter>
  );
}

beforeEach(() => {
  planState.user = makeUser({ plan: 'FREE', entitlements: FREE_ENTITLEMENTS });
  planState.usage = {
    activeSubscriptions: 0,
    contracts: 0,
    netWorthSnapshots: 0,
    reports: 1,
  };
});

describe('PlanUsageHint', () => {
  it('shows how much of the limit is used', () => {
    renderHint();

    expect(screen.getByText(/1 of 3 reports used on Free/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See Pro' })).toBeInTheDocument();
  });

  it('invites an upgrade once the limit is reached', () => {
    planState.usage = {
      activeSubscriptions: 0,
      contracts: 0,
      netWorthSnapshots: 0,
      reports: 3,
    };

    renderHint();

    expect(
      screen.getByRole('link', { name: 'Upgrade for unlimited' })
    ).toBeInTheDocument();
  });

  it('renders nothing on a plan without limits', () => {
    planState.user = makeUser({ plan: 'PRO' });

    const { container } = renderHint();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing until the usage is known', () => {
    planState.usage = null;

    const { container } = renderHint();

    expect(container).toBeEmptyDOMElement();
  });
});
