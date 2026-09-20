import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    loading: false,
    refetchUser: vi.fn(),
    updateUser: vi.fn(),
    user: state.user,
  }),
}));

import { makeUser } from '../../test/fixtures';
import { PastDueBanner } from './PastDueBanner';

function renderBanner() {
  return render(
    <MemoryRouter>
      <PastDueBanner />
    </MemoryRouter>
  );
}

beforeEach(() => {
  state.user = makeUser({ planStatus: 'PAST_DUE' });
});

describe('PastDueBanner', () => {
  it('warns about the failed payment and links to the fix', () => {
    renderBanner();

    expect(
      screen.getByText(/could not take your last Pro payment/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'update your payment method' })
    ).toHaveAttribute('href', '/profile');
  });

  it('says Pro stays on, so nobody thinks their data is capped', () => {
    renderBanner();

    expect(screen.getByText(/Pro stays on/)).toBeInTheDocument();
  });

  it('renders nothing while payments are healthy', () => {
    state.user = makeUser({ planStatus: 'ACTIVE' });

    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing before the user is known', () => {
    state.user = null;

    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
