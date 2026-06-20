import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

/**
 * Converts a ZodError into a GraphQLError that preserves the project's input
 * validation contract: a safe, user-facing message and an
 * `extensions.code: 'BAD_USER_INPUT'`. The first issue's message is surfaced;
 * the remaining issues are kept in `extensions.issues` for the server log.
 */
export function zodErrorToGraphQLError(error: ZodError): GraphQLError {
  const [firstIssue] = error.issues;
  const message = firstIssue?.message ?? 'Invalid input';

  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    },
  });
}
