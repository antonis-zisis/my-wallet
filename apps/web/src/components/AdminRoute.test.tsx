import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '../contexts/UserContext';
import { makeUser } from '../test/fixtures';
import { AdminRoute } from './AdminRoute';

vi.mock('../contexts/UserContext');

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<div>Admin Content</div>} />
        </Route>
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading indicator while the user is being fetched', () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the admin content for a superadmin', () => {
    vi.mocked(useUser).mockReturnValue({
      user: makeUser({ role: 'SUPERADMIN' }),
      loading: false,
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects a signed-in user without the role', () => {
    vi.mocked(useUser).mockReturnValue({
      user: makeUser({ role: 'USER' }),
      loading: false,
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects when there is no user record', () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});
