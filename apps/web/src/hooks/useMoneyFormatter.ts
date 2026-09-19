import { useCallback } from 'react';

import { useCurrency } from '../contexts/CurrencyContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { formatAmount } from '../utils/formatAmount';

type MoneyFormatterOptions = {
  showCurrency?: boolean;
  sign?: string;
};

export type MoneyFormatter = (
  amount: number,
  options?: MoneyFormatterOptions
) => string;

export function useMoneyFormatter(): MoneyFormatter {
  const { currency } = useCurrency();
  const { isAmountsHidden } = usePrivacy();

  return useCallback(
    (amount, options) =>
      formatAmount({
        amount,
        currency,
        isHidden: isAmountsHidden,
        ...options,
      }),
    [currency, isAmountsHidden]
  );
}
