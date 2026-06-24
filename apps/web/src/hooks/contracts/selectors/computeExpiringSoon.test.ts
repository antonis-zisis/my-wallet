import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeContract } from '../../../test/fixtures/contracts';
import { computeExpiringSoon } from './computeExpiringSoon';

describe('computeExpiringSoon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes contracts expiring within 30 days, soonest first', () => {
    const soon = makeContract({ id: 'soon', endDate: '2026-07-01T00:00:00Z' });
    const sooner = makeContract({
      id: 'sooner',
      endDate: '2026-06-26T00:00:00Z',
    });

    const result = computeExpiringSoon([soon, sooner]);

    expect(result.map((contract) => contract.id)).toEqual(['sooner', 'soon']);
  });

  it('excludes open-ended, expired, and far-future contracts', () => {
    const openEnded = makeContract({ id: 'open', endDate: null });
    const expired = makeContract({
      id: 'expired',
      endDate: '2026-06-01T00:00:00Z',
    });
    const farFuture = makeContract({
      id: 'far',
      endDate: '2026-12-01T00:00:00Z',
    });

    const result = computeExpiringSoon([openEnded, expired, farFuture]);

    expect(result).toEqual([]);
  });
});
