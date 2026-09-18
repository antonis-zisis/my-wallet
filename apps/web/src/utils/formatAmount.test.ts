import { describe, expect, it } from 'vitest';

import { formatAmount } from './formatAmount';

describe('formatAmount', () => {
  it('puts the euro symbol after the amount', () => {
    expect(formatAmount({ amount: 1234.5, currency: 'EUR' })).toBe(
      '1.234,50 €'
    );
  });

  it('puts the dollar symbol before the amount and groups with commas', () => {
    expect(formatAmount({ amount: 1234.5, currency: 'USD' })).toBe('$1,234.50');
  });

  it('puts the pound symbol before the amount', () => {
    expect(formatAmount({ amount: 1234.5, currency: 'GBP' })).toBe('£1,234.50');
  });

  it('defaults to euro when no currency is given', () => {
    expect(formatAmount({ amount: 10 })).toBe('10,00 €');
  });

  it('keeps the sign outside the symbol', () => {
    expect(formatAmount({ amount: 10, currency: 'USD', sign: '-' })).toBe(
      '-$10.00'
    );
    expect(formatAmount({ amount: 10, currency: 'EUR', sign: '+' })).toBe(
      '+10,00 €'
    );
  });

  it('masks the amount but keeps the currency when hidden', () => {
    expect(
      formatAmount({ amount: 1234.5, currency: 'USD', isHidden: true })
    ).toBe('$***');
  });

  it('omits the currency when showCurrency is false', () => {
    expect(
      formatAmount({ amount: 1234.5, currency: 'USD', showCurrency: false })
    ).toBe('1,234.50');
  });
});
