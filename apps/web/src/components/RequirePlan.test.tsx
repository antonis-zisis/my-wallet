import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const userState = vi.hoisted(() => ({
  loading: false,
  user: null as unknown,
}));

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    loading: userState.loading,
    user: userState.user,
    updateUser: vi.fn(),
  }),
}));

import { makeUser } from '../test/fixtures';
import { RequirePlan } from './RequirePlan';

function renderRequirePlan() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<RequirePlan />}>
          <Route path="/" element={<p>Dashboard</p>} />
        </Route>
        <Route path="/select-plan" element={<p>Choose your plan</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  userState.loading = false;
  userState.user = makeUser();
});

describe('RequirePlan', () => {
  it('renders the app for a user who has picked a plan', () => {
    renderRequirePlan();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('sends a user without a plan to the plan picker', () => {
    userState.user = makeUser({ plan: null });

    renderRequirePlan();

    expect(screen.getByText('Choose your plan')).toBeInTheDocument();
  });

  it('waits rather than redirecting while the user loads', () => {
    userState.loading = true;
    userState.user = null;

    renderRequirePlan();

    expect(screen.queryByText('Choose your plan')).toBeNull();
    expect(screen.queryByText('Dashboard')).toBeNull();
  });

  it('lets the app render when the user cannot be loaded at all', () => {
    userState.user = null;

    renderRequirePlan();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
