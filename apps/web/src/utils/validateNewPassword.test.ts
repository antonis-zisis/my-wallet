import { describe, expect, it } from 'vitest';

import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from './validateNewPassword';

describe('validateNewPassword', () => {
  it('returns null for a long enough matching pair', () => {
    const result = validateNewPassword({
      confirmPassword: 'sup3rsecret',
      newPassword: 'sup3rsecret',
    });

    expect(result).toBeNull();
  });

  it('returns a mismatch message when the passwords differ', () => {
    const result = validateNewPassword({
      confirmPassword: 'sup3rsecret',
      newPassword: 'sup3rsecrets',
    });

    expect(result).toBe('Passwords do not match.');
  });

  it('returns a length message when the password is too short', () => {
    const result = validateNewPassword({
      confirmPassword: 'abc',
      newPassword: 'abc',
    });

    expect(result).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  });

  it('reports the mismatch first when the password is both short and mismatched', () => {
    const result = validateNewPassword({
      confirmPassword: 'xyz',
      newPassword: 'abc',
    });

    expect(result).toBe('Passwords do not match.');
  });
});
