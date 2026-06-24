import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeContract } from '../../../test/fixtures/contracts';
import { getDaysUntilExpiration } from './getDaysUntilExpiration';

describe('getDaysUntilExpiration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for an open-ended contract', () => {
    const result = getDaysUntilExpiration(makeContract({ endDate: null }));

    expect(result).toBeNull();
  });

  it('returns the number of days until the end date', () => {
    const result = getDaysUntilExpiration(
      makeContract({ endDate: '2026-07-04T00:00:00Z' })
    );

    expect(result).toBe(10);
  });

  it('returns a negative number for an expired contract', () => {
    const result = getDaysUntilExpiration(
      makeContract({ endDate: '2026-06-14T00:00:00Z' })
    );

    expect(result).toBe(-10);
  });
});
