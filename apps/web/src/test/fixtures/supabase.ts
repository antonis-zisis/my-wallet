import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';

type GetSessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;
type SignInResult = Awaited<
  ReturnType<typeof supabase.auth.signInWithPassword>
>;

interface SessionOverrides {
  user?: { id: string };
  access_token?: string;
}

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
