import {
  type Currency,
  CURRENCY_CONFIG,
  DEFAULT_CURRENCY,
} from '../types/currency';
import { formatMoneyOrMask } from './formatMoney';

export type FormatAmountInput = {
  amount: number;
  currency?: Currency;
  isHidden?: boolean;
  showCurrency?: boolean;
  sign?: string;
};

export function formatAmount({
  amount,
  currency = DEFAULT_CURRENCY,
  isHidden = false,
  showCurrency = true,
  sign = '',
}: FormatAmountInput): string {
  const value = formatMoneyOrMask(amount, isHidden, currency);

  if (!showCurrency) {
    return `${sign}${value}`;
  }

  const { isSpaced, symbol, symbolPosition } = CURRENCY_CONFIG[currency];
  const separator = isSpaced ? ' ' : '';

  if (symbolPosition === 'prefix') {
    return `${sign}${symbol}${separator}${value}`;
  }

  return `${sign}${value}${separator}${symbol}`;
}
