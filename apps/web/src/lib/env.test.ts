import { describe, expect, it, vi } from 'vitest';

// seed the required vars before the import is evaluated, so the
// module-level `parseEnv()` call in env.ts does not throw on import
vi.hoisted(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'key');
});

import { parseEnv } from './env';

const validEnv = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'key',
};

describe('parseEnv', () => {
  it('defaults VITE_GRAPHQL_URL to the relative /graphql path', () => {
    const env = parseEnv(validEnv);

    expect(env.VITE_GRAPHQL_URL).toBe('/graphql');
  });

  it('keeps an explicit VITE_GRAPHQL_URL', () => {
    const env = parseEnv({
      ...validEnv,
      VITE_GRAPHQL_URL: 'https://api.example.com/graphql',
    });

    expect(env.VITE_GRAPHQL_URL).toBe('https://api.example.com/graphql');
  });

  it('throws a readable error when a required variable is missing', () => {
    expect(() => parseEnv({})).toThrow(/Invalid environment configuration/);
  });

  it('rejects an invalid VITE_SUPABASE_URL', () => {
    expect(() =>
      parseEnv({ ...validEnv, VITE_SUPABASE_URL: 'not-a-url' })
    ).toThrow('VITE_SUPABASE_URL must be a valid URL');
  });
});
