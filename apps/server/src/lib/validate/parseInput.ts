import { z } from 'zod';

import { zodErrorToGraphQLError } from './zodErrorToGraphQLError';

export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown
): z.infer<Schema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw zodErrorToGraphQLError(result.error);
  }

  return result.data;
}
