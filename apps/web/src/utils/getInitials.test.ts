import { describe, expect, it } from 'vitest';

import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('returns first and last initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single initial when full name has one word', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('uses first and last name ignoring middle names', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('handles extra whitespace in full name', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });

  it('uppercases lowercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('returns one character for non-splittable input like an email', () => {
    expect(getInitials('test@example.com')).toBe('T');
  });

  it('uppercases the result', () => {
    expect(getInitials('john@example.com')).toBe('J');
  });
});
