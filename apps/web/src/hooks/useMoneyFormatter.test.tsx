import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMoneyFormatter } from './useMoneyFormatter';

const useCurrency = vi.fn();
const usePrivacy = vi.fn();

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => useCurrency(),
}));

vi.mock('../contexts/PrivacyContext', () => ({
  usePrivacy: () => usePrivacy(),
}));

describe('useMoneyFormatter', () => {
  beforeEach(() => {
    useCurrency.mockReset();
    usePrivacy.mockReset();
    useCurrency.mockReturnValue({ currency: 'EUR', symbol: '€' });
    usePrivacy.mockReturnValue({ isAmountsHidden: false });
  });

  it('formats in the currency from context', () => {
    useCurrency.mockReturnValue({ currency: 'USD', symbol: '$' });

    const { result } = renderHook(() => useMoneyFormatter());

    expect(result.current(1234.5)).toBe('$1,234.50');
  });

  it('masks the amount when privacy mode is on', () => {
    usePrivacy.mockReturnValue({ isAmountsHidden: true });

    const { result } = renderHook(() => useMoneyFormatter());

    expect(result.current(1234.5)).toBe('***\u00A0€');
  });

  it('passes through the sign', () => {
    const { result } = renderHook(() => useMoneyFormatter());

    expect(result.current(1234.5, { sign: '+' })).toBe('+1.234,50\u00A0€');
  });
});
