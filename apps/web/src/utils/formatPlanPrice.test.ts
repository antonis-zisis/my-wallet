import { describe, expect, it } from 'vitest';

import { formatPlanAmount, formatPlanPrice } from './formatPlanPrice';

describe('formatPlanAmount', () => {
  it('converts minor units into a currency amount', () => {
    expect(formatPlanAmount(400, 'EUR')).toContain('4');
    expect(formatPlanAmount(400, 'EUR')).toContain('€');
  });

  it('shows cents only when the amount has them', () => {
    expect(formatPlanAmount(400, 'EUR')).not.toContain('00');
    expect(formatPlanAmount(3840, 'EUR')).toContain('38,40');
  });

  it('formats a currency the app does not display amounts in', () => {
    expect(formatPlanAmount(1000, 'CHF')).toContain('10');
  });
});

describe('formatPlanPrice', () => {
  it('names the period the price covers', () => {
    expect(
      formatPlanPrice({ amount: 400, currency: 'EUR', interval: 'MONTH' })
    ).toContain('/ month');
    expect(
      formatPlanPrice({ amount: 3840, currency: 'EUR', interval: 'YEAR' })
    ).toContain('/ year');
  });
});
