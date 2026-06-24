import { describe, expect, it } from 'vitest';

import { buildContractsWhere } from './buildContractsWhere';

const USER_ID = 'user-1';
const NOW = new Date('2026-06-24T00:00:00Z');

describe('buildContractsWhere', () => {
  it('scopes to the user when expired is undefined', () => {
    const where = buildContractsWhere({ now: NOW, userId: USER_ID });

    expect(where).toEqual({ userId: USER_ID });
  });

  it('matches only past end dates when expired is true', () => {
    const where = buildContractsWhere({
      expired: true,
      now: NOW,
      userId: USER_ID,
    });

    expect(where).toEqual({ userId: USER_ID, endDate: { lt: NOW } });
  });

  it('matches open-ended and future contracts when expired is false', () => {
    const where = buildContractsWhere({
      expired: false,
      now: NOW,
      userId: USER_ID,
    });

    expect(where).toEqual({
      userId: USER_ID,
      OR: [{ endDate: null }, { endDate: { gte: NOW } }],
    });
  });
});
