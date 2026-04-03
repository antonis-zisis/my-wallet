import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../contexts/AuthContext');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading indicator when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      updatePassword: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to /login when session is null and not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      updatePassword: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders child route when session exists', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'user-1' } } as ReturnType<
        typeof useAuth
      >['session'],
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      updatePassword: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
