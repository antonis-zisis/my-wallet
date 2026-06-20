import { describe, expect, it } from 'vitest';

import { amount, boundedString, date, enumField, httpUrl } from './fields';

describe('boundedString', () => {
  it('accepts a string within the limit', () => {
    expect(boundedString('Name', 5).parse('abc')).toBe('abc');
  });

  it('rejects a string over the limit with a field-specific message', () => {
    const result = boundedString('Name', 3).safeParse('abcd');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'Name must be 3 characters or fewer'
    );
  });
});

describe('amount', () => {
  it('accepts a non-negative finite number', () => {
    expect(amount.parse(10)).toBe(10);
  });

  it('rejects a negative number', () => {
    const result = amount.safeParse(-1);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'Amount must be a non-negative number'
    );
  });

  it('rejects a non-finite number', () => {
    expect(amount.safeParse(Infinity).success).toBe(false);
  });
});

describe('date', () => {
  it('coerces a valid date string to a Date', () => {
    expect(date.parse('2024-01-15')).toEqual(new Date('2024-01-15'));
  });

  it('rejects an invalid date string', () => {
    const result = date.safeParse('not-a-date');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Invalid date');
  });
});

describe('enumField', () => {
  const cycle = enumField(['WEEKLY', 'MONTHLY'] as const, 'Billing cycle');

  it('accepts an allowed value', () => {
    expect(cycle.parse('WEEKLY')).toBe('WEEKLY');
  });

  it('rejects a value outside the set with the allowed list', () => {
    const result = cycle.safeParse('DAILY');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'Billing cycle must be one of: WEEKLY, MONTHLY'
    );
  });
});

describe('httpUrl', () => {
  it('accepts an https url', () => {
    expect(httpUrl.parse('https://example.com')).toBe('https://example.com');
  });

  it('rejects a non-http scheme', () => {
    expect(httpUrl.safeParse('ftp://example.com').success).toBe(false);
  });

  it('rejects a malformed url', () => {
    expect(httpUrl.safeParse('not a url').success).toBe(false);
  });
});
