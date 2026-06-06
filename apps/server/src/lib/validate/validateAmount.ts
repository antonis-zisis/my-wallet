import { GraphQLError } from 'graphql';

export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new GraphQLError('Amount must be a non-negative number', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}
