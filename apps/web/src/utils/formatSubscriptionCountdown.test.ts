import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatCancellationCountdown,
  formatTrialCountdown,
} from './formatSubscriptionCountdown';

describe('formatCancellationCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports "ended" with a formatted date when the end date is in the past', () => {
    const result = formatCancellationCountdown('2026-04-01T00:00:00Z');

    expect(result).toMatch(/^ended /);
  });

  it('reports "ends today" when the end date is today', () => {
    const result = formatCancellationCountdown('2026-04-15T00:00:00Z');

    expect(result).toBe('ends today');
  });

  it('reports "ends tomorrow" when the end date is tomorrow', () => {
    const result = formatCancellationCountdown('2026-04-16T00:00:00Z');

    expect(result).toBe('ends tomorrow');
  });

  it('reports "ends in N days" with a formatted date when further out', () => {
    const result = formatCancellationCountdown('2026-04-30T00:00:00Z');

    expect(result).toMatch(/^ends in 15 days · /);
  });
});

describe('formatTrialCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports "trial ended" with a formatted date when the trial end is in the past', () => {
    const result = formatTrialCountdown('2026-04-01T00:00:00Z');

    expect(result).toMatch(/^trial ended /);
  });

  it('reports "trial ends today" when the trial ends today', () => {
    const result = formatTrialCountdown('2026-04-15T00:00:00Z');

    expect(result).toBe('trial ends today');
  });

  it('reports "trial ends tomorrow" when the trial ends tomorrow', () => {
    const result = formatTrialCountdown('2026-04-16T00:00:00Z');

    expect(result).toBe('trial ends tomorrow');
  });

  it('reports "trial ends in N days" with a formatted date when further out', () => {
    const result = formatTrialCountdown('2026-04-30T00:00:00Z');

    expect(result).toMatch(/^trial ends in 15 days · /);
  });
});
