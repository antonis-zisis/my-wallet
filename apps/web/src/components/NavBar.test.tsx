import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../contexts/UserContext', () => ({
  useUser: vi.fn().mockReturnValue({
    user: { id: '1', email: 'test@example.com', fullName: 'John Doe' },
    loading: false,
    updateUser: vi.fn(),
  }),
}));

const { useUser } = await import('../contexts/UserContext');

const renderNavBar = async () => {
  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
};

describe('NavBar', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(useUser).mockReturnValue({
      user: { id: '1', email: 'test@example.com', fullName: 'John Doe' },
      loading: false,
      updateUser: vi.fn(),
    });
  });

  it('renders Dashboard link', async () => {
    await renderNavBar();
    const link = screen.getByText('Dashboard');
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Reports link', async () => {
    await renderNavBar();
    const link = screen.getByText('Reports');
    expect(link.closest('a')).toHaveAttribute('href', '/reports');
  });

  it('renders Subscriptions link', async () => {
    await renderNavBar();
    const link = screen.getByText('Subscriptions');
    expect(link.closest('a')).toHaveAttribute('href', '/subscriptions');
  });

  it('renders Net Worth link', async () => {
    await renderNavBar();
    const link = screen.getByText('Net Worth');
    expect(link.closest('a')).toHaveAttribute('href', '/net-worth');
  });

  it('contains theme toggle', async () => {
    await renderNavBar();
    expect(screen.getByLabelText(/Switch to .+ mode/)).toBeInTheDocument();
  });

  it('shows avatar with correct initial from fullName', async () => {
    await renderNavBar();
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toHaveTextContent('JD');
  });

  it('shows avatar with email initials when fullName is null', async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: '1', email: 'test@example.com', fullName: null },
      loading: false,
      updateUser: vi.fn(),
    });

    await renderNavBar();
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toHaveTextContent('TE');
  });

  it('does not show avatar when user is null', async () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
      updateUser: vi.fn(),
    });

    await renderNavBar();
    expect(screen.queryByLabelText('User menu')).not.toBeInTheDocument();
  });

  it('shows dropdown with Profile and Log out on avatar click', async () => {
    await renderNavBar();

    fireEvent.click(screen.getByLabelText('User menu'));

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('navigates to /profile when Profile is clicked', async () => {
    await renderNavBar();

    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByText('Profile'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
