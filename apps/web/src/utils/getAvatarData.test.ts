import { describe, expect, it } from 'vitest';

import { getAvatarData } from './getAvatarData';

describe('getAvatarData', () => {
  it('derives initials and label from the full name when present', () => {
    const result = getAvatarData({
      email: 'jane@example.com',
      fullName: 'Jane Smith',
    });

    expect(result).toEqual({ initials: 'JS', label: 'Jane Smith' });
  });

  it('falls back to the email when there is no full name', () => {
    const result = getAvatarData({
      email: 'jane@example.com',
      fullName: null,
    });

    expect(result).toEqual({ initials: 'J', label: 'jane@example.com' });
  });
});
