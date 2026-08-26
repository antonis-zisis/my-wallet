import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { supabase } from '../lib/supabase';
import { makeSupabaseSession, resolveGetSession } from '../test/fixtures';
import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const {
    isRecoveringPassword,
    loading,
    sendPasswordResetEmail,
    session,
    signIn,
    signOut,
  } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? 'authenticated' : 'none'}</span>
      <span data-testid="recovering">{String(isRecoveringPassword)}</span>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => sendPasswordResetEmail('test@example.com')}>
        Reset Password
      </button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts loading then resolves with no session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('session')).toHaveTextContent('none');
  });

  it('provides session when getSession returns one', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce(
      resolveGetSession(makeSupabaseSession())
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('session')).toHaveTextContent('authenticated');
  });

  it('signIn calls supabase.auth.signInWithPassword', async () => {
    const { userEvent } = await import('@testing-library/user-event');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.setup().click(screen.getByText('Sign In'));

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('signOut calls supabase.auth.signOut', async () => {
    const { userEvent } = await import('@testing-library/user-event');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.setup().click(screen.getByText('Sign Out'));

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('sendPasswordResetEmail asks supabase to email a recovery link', async () => {
    const { userEvent } = await import('@testing-library/user-event');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.setup().click(screen.getByText('Reset Password'));

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: `${window.location.origin}/reset-password` }
    );
  });

  it('flags password recovery when supabase emits PASSWORD_RECOVERY', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('recovering')).toHaveTextContent('false');

    const [onAuthStateChange] = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0];
    act(() => {
      onAuthStateChange('PASSWORD_RECOVERY', makeSupabaseSession());
    });

    expect(screen.getByTestId('recovering')).toHaveTextContent('true');
  });

  it('clears the recovery flag on sign out', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const [onAuthStateChange] = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0];
    act(() => {
      onAuthStateChange('PASSWORD_RECOVERY', makeSupabaseSession());
    });
    act(() => {
      onAuthStateChange('SIGNED_OUT', null);
    });

    expect(screen.getByTestId('recovering')).toHaveTextContent('false');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleSpy.mockRestore();
  });
});
