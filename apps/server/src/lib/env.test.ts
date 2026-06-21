import { describe, expect, it, vi } from 'vitest';

// seed the required vars before the import is evaluated
vi.hoisted(() => {
  process.env.PG_USER = 'user';
  process.env.PG_PASSWORD = 'password';
  process.env.PG_DATABASE = 'wallet';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'secret';
});

import { parseEnv } from './env';

const validEnv = {
  PG_USER: 'user',
  PG_PASSWORD: 'password',
  PG_DATABASE: 'wallet',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'secret',
};

describe('parseEnv', () => {
  it('applies defaults for optional variables', () => {
    const env = parseEnv(validEnv);

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
    expect(env.PG_HOST).toBe('localhost');
    expect(env.PG_PORT).toBe(5432);
  });

  it('coerces numeric variables from strings', () => {
    const env = parseEnv({ ...validEnv, PORT: '8080', PG_PORT: '6543' });

    expect(env.PORT).toBe(8080);
    expect(env.PG_PORT).toBe(6543);
  });

  it('throws a readable error listing missing required variables', () => {
    expect(() => parseEnv({ SUPABASE_URL: 'not-a-url' })).toThrow(
      /Invalid environment configuration/
    );
  });

  it('rejects an invalid SUPABASE_URL', () => {
    expect(() => parseEnv({ ...validEnv, SUPABASE_URL: 'not-a-url' })).toThrow(
      'SUPABASE_URL must be a valid URL'
    );
  });
});
