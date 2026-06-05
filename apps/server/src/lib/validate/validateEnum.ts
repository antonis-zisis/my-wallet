import { GraphQLError } from 'graphql';

export function validateEnum<T extends string>(
  value: string,
  allowed: ReadonlyArray<T>,
  field: string
): T {
  if (!allowed.includes(value as T)) {
    throw new GraphQLError(`${field} must be one of: ${allowed.join(', ')}`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return value as T;
}
