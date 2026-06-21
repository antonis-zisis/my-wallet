import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

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
