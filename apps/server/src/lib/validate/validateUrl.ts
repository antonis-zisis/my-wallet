import { GraphQLError } from 'graphql';

export function validateUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new GraphQLError('Invalid URL format', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new GraphQLError('URL must use http or https scheme', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}
