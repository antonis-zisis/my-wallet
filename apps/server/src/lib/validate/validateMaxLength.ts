import { GraphQLError } from 'graphql';

export function validateMaxLength(
  value: string,
  field: string,
  maxLength: number
): void {
  if (value.length > maxLength) {
    throw new GraphQLError(
      `${field} must be ${maxLength} characters or fewer`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }
}
