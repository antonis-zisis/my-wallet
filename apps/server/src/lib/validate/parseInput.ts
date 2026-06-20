import { z } from 'zod';

import { zodErrorToGraphQLError } from './zodErrorToGraphQLError';

/**
 * Parses a GraphQL mutation input against its Zod schema, returning the typed,
 * coerced data on success and throwing a `BAD_USER_INPUT` GraphQLError on
 * failure. Resolvers call this in place of the old imperative `validateX` ladder.
 */
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
