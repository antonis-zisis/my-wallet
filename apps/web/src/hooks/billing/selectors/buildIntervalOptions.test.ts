import { describe, expect, it } from 'vitest';

import { type PlanPrice } from '../../../types/billing';
import { buildIntervalOptions } from './buildIntervalOptions';

const monthly: PlanPrice = { amount: 400, currency: 'EUR', interval: 'MONTH' };
const yearly: PlanPrice = { amount: 3840, currency: 'EUR', interval: 'YEAR' };

describe('buildIntervalOptions', () => {
  it('labels each interval with its formatted price', () => {
    const options = buildIntervalOptions([monthly, yearly]);

    expect(options.map((option) => option.label)).toEqual([
      'Monthly',
      'Yearly',
    ]);
    expect(options[0].priceLabel).toContain('4');
    expect(options[1].priceLabel).toContain('38');
  });

  it('puts monthly first however the prices arrive', () => {
    const options = buildIntervalOptions([yearly, monthly]);

    expect(options[0].interval).toBe('MONTH');
  });

  it('works out what yearly saves against twelve monthly payments', () => {
    const options = buildIntervalOptions([monthly, yearly]);

    expect(options[1].savingsLabel).toBe('Save 20%');
  });

  it('claims no saving when yearly costs the same or more', () => {
    const options = buildIntervalOptions([
      monthly,
      { ...yearly, amount: 4800 },
    ]);

    expect(options[1].savingsLabel).toBeNull();
  });

  it('claims no saving when there is nothing to compare against', () => {
    const options = buildIntervalOptions([yearly]);

    expect(options[0].savingsLabel).toBeNull();
  });

  it('returns nothing when billing is not configured', () => {
    expect(buildIntervalOptions([])).toEqual([]);
  });
});
