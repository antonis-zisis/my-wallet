import { z } from 'zod';

export function boundedString(field: string, maxLength: number) {
  return z
    .string()
    .max(maxLength, `${field} must be ${maxLength} characters or fewer`);
}

export const amount = z
  .number()
  .refine(
    (value) => Number.isFinite(value) && value >= 0,
    'Amount must be a non-negative number'
  );

export const date = z.coerce.date({ error: 'Invalid date' });

export function enumField<
  const Values extends readonly [string, ...Array<string>],
>(values: Values, field: string) {
  return z.enum(values, {
    error: `${field} must be one of: ${values.join(', ')}`,
  });
}

export const httpUrl = z
  .url({ protocol: /^https?$/, error: 'Invalid URL format' })
  .max(2048, 'URL must be 2048 characters or fewer');
