import { describe, expect, it } from 'vitest';

import { buildAdminUsersWhere } from './buildAdminUsersWhere';

describe('buildAdminUsersWhere', () => {
  it('matches everyone when no search is given', () => {
    expect(buildAdminUsersWhere({})).toEqual({});
  });

  it('ignores a search of only whitespace', () => {
    expect(buildAdminUsersWhere({ search: '   ' })).toEqual({});
  });

  it('searches email and full name case-insensitively', () => {
    expect(buildAdminUsersWhere({ search: '  Ada ' })).toEqual({
      OR: [
        { email: { contains: 'Ada', mode: 'insensitive' } },
        { fullName: { contains: 'Ada', mode: 'insensitive' } },
      ],
    });
  });
});
