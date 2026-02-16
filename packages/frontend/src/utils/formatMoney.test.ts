import { describe, expect, it } from 'vitest';

import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('formats a number below 1000', () => {
    expect(formatMoney(500)).toBe('500,00');
  });

  it('formats a number above 1000 with dot separator', () => {
    expect(formatMoney(2500)).toBe('2.500,00');
  });

  it('formats a large number with multiple separators', () => {
    expect(formatMoney(1234567.89)).toBe('1.234.567,89');
  });

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0,00');
  });

  it('formats a number with existing decimal places', () => {
    expect(formatMoney(1000.5)).toBe('1.000,50');
  });
});
