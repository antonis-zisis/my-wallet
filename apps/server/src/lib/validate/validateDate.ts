import { GraphQLError } from 'graphql';

export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new GraphQLError(`Invalid date: "${dateString}"`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return date;
}
