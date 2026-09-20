import { CombinedGraphQLErrors } from '@apollo/client/errors';

export function getPlanLimitMessage(error: unknown): string | null {
  if (!CombinedGraphQLErrors.is(error)) {
    return null;
  }

  const planLimitError = error.errors.find(
    (graphQLError) => graphQLError.extensions?.reason === 'PLAN_LIMIT'
  );

  return planLimitError?.message ?? null;
}
