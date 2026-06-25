import { describe, expect, it } from 'vitest';

import {
  billingCycleLabel,
  formatUrgencyLabel,
  getUrgencyColor,
} from './renewalDisplay';

describe('formatUrgencyLabel', () => {
  it('returns "Today" for 0', () => {
    expect(formatUrgencyLabel(0)).toBe('Today');
  });

  it('returns "Tomorrow" for 1', () => {
    expect(formatUrgencyLabel(1)).toBe('Tomorrow');
  });

  it('returns "in Nd" for any other value', () => {
    expect(formatUrgencyLabel(2)).toBe('in 2d');
    expect(formatUrgencyLabel(40)).toBe('in 40d');
  });
});

describe('getUrgencyColor', () => {
  it('uses the danger tier for renewals within 3 days', () => {
    expect(getUrgencyColor(0)).toContain('red');
    expect(getUrgencyColor(3)).toContain('red');
  });

  it('uses the warning tier for 4-7 days', () => {
    expect(getUrgencyColor(4)).toContain('amber');
    expect(getUrgencyColor(7)).toContain('amber');
  });

  it('uses the neutral tier beyond 7 days', () => {
    expect(getUrgencyColor(8)).toBe('text-text-tertiary');
    expect(getUrgencyColor(40)).toBe('text-text-tertiary');
  });
});

describe('billingCycleLabel', () => {
  it('returns the matching label for each billing cycle', () => {
    expect(billingCycleLabel('WEEKLY')).toBe('Weekly');
    expect(billingCycleLabel('MONTHLY')).toBe('Monthly');
    expect(billingCycleLabel('QUARTERLY')).toBe('Quarterly');
    expect(billingCycleLabel('BI_ANNUAL')).toBe('Bi-annual');
    expect(billingCycleLabel('YEARLY')).toBe('Yearly');
  });
});
