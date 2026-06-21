import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { zodErrorToGraphQLError } from './zodErrorToGraphQLError';

describe('zodErrorToGraphQLError', () => {
  const schema = z.object({
    name: z.string().max(3, 'Name must be 3 characters or fewer'),
    amount: z.number().nonnegative('Amount must be a non-negative number'),
  });

  it('surfaces the first issue message as the GraphQLError message', () => {
    const error = schema.safeParse({ name: 'too long', amount: 1 })
      .error as z.ZodError;

    const graphQLError = zodErrorToGraphQLError(error);

    expect(graphQLError).toBeInstanceOf(GraphQLError);
    expect(graphQLError.message).toBe('Name must be 3 characters or fewer');
  });

  it('tags the error with the BAD_USER_INPUT code', () => {
    const error = schema.safeParse({ name: 'ok', amount: -1 })
      .error as z.ZodError;

    const graphQLError = zodErrorToGraphQLError(error);

    expect(graphQLError.extensions.code).toBe('BAD_USER_INPUT');
  });

  it('keeps every issue with its path for the server log', () => {
    const error = schema.safeParse({ name: 'too long', amount: -1 })
      .error as z.ZodError;

    const graphQLError = zodErrorToGraphQLError(error);

    expect(graphQLError.extensions.issues).toEqual([
      { path: 'name', message: 'Name must be 3 characters or fewer' },
      { path: 'amount', message: 'Amount must be a non-negative number' },
    ]);
  });
});
