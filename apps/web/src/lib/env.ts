import { z } from 'zod';

export const EnvSchema = z.object({
  VITE_GRAPHQL_URL: z.string().min(1).default('/graphql'),
  VITE_SUPABASE_URL: z.url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required'),
  VITE_LOGO_DEV_TOKEN: z.string().default(''),
});

export type Env = z.infer<typeof EnvSchema>;

export function parseEnv(source: unknown = import.meta.env): Env {
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
