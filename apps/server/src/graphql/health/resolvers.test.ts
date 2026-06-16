import { describe, expect, it } from 'vitest';

import { healthResolvers } from './resolvers';

describe('healthResolvers.Query.health', () => {
  it('reports that the server is running', () => {
    const result = healthResolvers.Query.health();

    expect(result).toBe('GraphQL server is running!');
  });
});
