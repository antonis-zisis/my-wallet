import { MockLink } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { HEALTH_QUERY } from '../graphql/health';
import { MockedProvider } from '../test/apollo-test-utils';
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

vi.mock('../contexts/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

const { useUser } = await import('../contexts/UserContext');

const healthMock = {
  request: { query: HEALTH_QUERY },
  result: { data: { health: 'OK' } },
};

const healthErrorMock = {
  request: { query: HEALTH_QUERY },
  error: new Error('Connection failed'),
};

const renderNavBar = async (
  mocks: Array<MockLink.MockedResponse> = [healthMock]
) => {
  render(
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <NavBar />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Overview')).toBeInTheDocument();
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

  it('renders Overview link', async () => {
    await renderNavBar();
    const link = screen.getByText('Overview');
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

  it('shows theme toggle button in the toolbar', async () => {
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
    expect(avatar).toHaveTextContent('T');
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

  it('renders brand link', async () => {
    await renderNavBar();
    expect(screen.getByText('My Wallet').closest('a')).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('shows full name and email in dropdown header', async () => {
    await renderNavBar();
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows only email in dropdown header when fullName is null', async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: '1', email: 'test@example.com', fullName: null },
      loading: false,
      updateUser: vi.fn(),
    });
    await renderNavBar();
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows "Server connected" tooltip on health dot', async () => {
    await renderNavBar();
    await waitFor(() => {
      expect(screen.getByTitle('Server connected')).toBeInTheDocument();
    });
  });

  it('shows "Server offline" tooltip on health dot when server errors', async () => {
    await renderNavBar([healthErrorMock]);
    await waitFor(() => {
      expect(screen.getByTitle('Server offline')).toBeInTheDocument();
    });
  });
});
