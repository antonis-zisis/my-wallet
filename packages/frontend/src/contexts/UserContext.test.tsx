import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GET_ME } from '../graphql/user';
import { supabase } from '../lib/supabase';
import { MockedProvider } from '../test/apollo-test-utils';
import { AuthProvider } from './AuthContext';
import { UserProvider, useUser } from './UserContext';

const mockUser = {
  id: 'db-user-1',
  email: 'test@example.com',
  fullName: 'John Doe',
};

function TestConsumer() {
  const { user, loading } = useUser();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">
        {user ? user.fullName || user.email : 'none'}
      </span>
    </div>
  );
}

const renderWithProviders = (mocks: Array<unknown> = []) => {
  return render(
    <AuthProvider>
      <MockedProvider mocks={mocks}>
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      </MockedProvider>
    </AuthProvider>
  );
};

describe('UserContext', () => {
  it('skips query when there is no session', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('fetches user when session exists', async () => {
    const mockSession = { user: { id: 'user-1' }, access_token: 'token' };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    } as ReturnType<typeof supabase.auth.getSession> extends Promise<infer U>
      ? U
      : never);

    const mocks = [
      {
        request: { query: GET_ME },
        result: { data: { me: mockUser } },
      },
    ];

    renderWithProviders(mocks);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
  });

  it('falls back to email when fullName is null', async () => {
    const mockSession = { user: { id: 'user-1' }, access_token: 'token' };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    } as ReturnType<typeof supabase.auth.getSession> extends Promise<infer U>
      ? U
      : never);

    const mocks = [
      {
        request: { query: GET_ME },
        result: { data: { me: { ...mockUser, fullName: null } } },
      },
    ];

    renderWithProviders(mocks);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('throws when useUser is used outside UserProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useUser must be used within a UserProvider'
    );

    consoleSpy.mockRestore();
  });
});
