import { describe, expect, it } from 'vitest';

import { buildSubscriptionsWhere } from './buildSubscriptionsWhere';

const USER_ID = 'user-1';
const NOW = new Date('2026-06-01T00:00:00Z');

describe('buildSubscriptionsWhere', () => {
  it('returns a userId-only where clause when active is undefined', () => {
    const where = buildSubscriptionsWhere({ now: NOW, userId: USER_ID });

    expect(where).toEqual({ userId: USER_ID });
  });

  it('returns isActive + OR clause for active=true', () => {
    const where = buildSubscriptionsWhere({
      active: true,
      now: NOW,
      userId: USER_ID,
    });

    expect(where).toEqual({
      userId: USER_ID,
      isActive: true,
      OR: [
        { cancelledAt: null },
        { cancelledAt: { not: null }, endDate: { gt: NOW } },
      ],
    });
  });

  it('returns inactive-or-cancelled-and-expired OR clause for active=false', () => {
    const where = buildSubscriptionsWhere({
      active: false,
      now: NOW,
      userId: USER_ID,
    });

    expect(where).toEqual({
      userId: USER_ID,
      OR: [
        { isActive: false },
        {
          isActive: true,
          cancelledAt: { not: null },
          endDate: { lte: NOW },
        },
      ],
    });
  });
});
