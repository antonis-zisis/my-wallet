import 'dotenv/config';

import { z } from 'zod';

/**
 * Single source of truth for server environment configuration. The schema is
 * parsed once at boot (`env`), so a missing or malformed variable fails fast with
 * a readable message instead of surfacing lazily on the first request. Consumers
 * (`lib/prisma.ts`, `middleware/auth.ts`, `index.ts`) read the typed `env`.
 */
export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  PG_HOST: z.string().min(1).default('localhost'),
  PG_PORT: z.coerce.number().int().positive().default(5432),
  PG_USER: z.string().min(1, 'PG_USER is required'),
  PG_PASSWORD: z.string().min(1, 'PG_PASSWORD is required'),
  PG_DATABASE: z.string().min(1, 'PG_DATABASE is required'),
  SUPABASE_URL: z.url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SECRET_KEY: z.string().min(1, 'SUPABASE_SECRET_KEY is required'),
  // Only needed for seeding, not required for normal operation.
  SEED_USER_ID: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return result.data;
}

export const env = parseEnv();
