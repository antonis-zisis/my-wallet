import { describe, expect, it } from 'vitest';

import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('returns first and last initials from full name', () => {
    expect(getInitials({ fullName: 'John Doe', email: 'j@example.com' })).toBe(
      'JD'
    );
  });

  it('returns single initial when full name has one word', () => {
    expect(getInitials({ fullName: 'John', email: 'j@example.com' })).toBe('J');
  });

  it('uses first and last name ignoring middle names', () => {
    expect(
      getInitials({ fullName: 'John Michael Doe', email: 'j@example.com' })
    ).toBe('JD');
  });

  it('handles extra whitespace in full name', () => {
    expect(
      getInitials({ fullName: '  John   Doe  ', email: 'j@example.com' })
    ).toBe('JD');
  });

  it('uppercases lowercase initials', () => {
    expect(getInitials({ fullName: 'john doe', email: 'j@example.com' })).toBe(
      'JD'
    );
  });

  it('returns first two characters of email when fullName is null', () => {
    expect(getInitials({ fullName: null, email: 'test@example.com' })).toBe(
      'TE'
    );
  });

  it('returns first two characters of email when fullName is empty', () => {
    expect(getInitials({ fullName: '', email: 'ab@example.com' })).toBe('AB');
  });

  it('uppercases email initials', () => {
    expect(getInitials({ fullName: null, email: 'john@example.com' })).toBe(
      'JO'
    );
  });
});
