import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseInput } from './parseInput';

describe('parseInput', () => {
  const schema = z.object({
    amount: z.number().nonnegative('Amount must be a non-negative number'),
    startDate: z.coerce.date(),
  });

  it('returns the coerced, typed data on success', () => {
    const data = parseInput(schema, {
      amount: 10,
      startDate: '2024-01-15',
    });

    expect(data.amount).toBe(10);
    expect(data.startDate).toEqual(new Date('2024-01-15'));
  });

  it('throws a BAD_USER_INPUT GraphQLError on failure', () => {
    expect(() =>
      parseInput(schema, { amount: -1, startDate: '2024-01-15' })
    ).toThrow(GraphQLError);
  });
});
