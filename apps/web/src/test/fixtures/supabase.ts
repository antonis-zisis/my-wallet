import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';

type GetSessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;
type SignInResult = Awaited<
  ReturnType<typeof supabase.auth.signInWithPassword>
>;
type SignUpResult = Awaited<ReturnType<typeof supabase.auth.signUp>>;

type SessionOverrides = {
  user?: { id: string };
  access_token?: string;
};

type SignUpOverrides = {
  error?: { message: string } | null;
  session?: Session | null;
};

export function makeSupabaseSession(overrides: SessionOverrides = {}): Session {
  return {
    user: { id: 'user-1' },
    access_token: 'token',
    ...overrides,
  } as unknown as Session;
}

export function resolveGetSession(session: Session | null): GetSessionResult {
  return { data: { session }, error: null } as GetSessionResult;
}

export function resolveSignIn(
  result: { error?: { message: string } | null } = {}
): SignInResult {
  return {
    data: { user: null, session: null },
    error: result.error ?? null,
  } as SignInResult;
}

export function resolveSignUp(overrides: SignUpOverrides = {}): SignUpResult {
  return {
    data: { user: null, session: overrides.session ?? null },
    error: overrides.error ?? null,
  } as SignUpResult;
}
