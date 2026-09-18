import {
  type Currency,
  CURRENCY_CONFIG,
  DEFAULT_CURRENCY,
} from '../types/currency';

export function formatMoney(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY
): string {
  return amount.toLocaleString(CURRENCY_CONFIG[currency].locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyOrMask(
  amount: number,
  isHidden: boolean,
  currency: Currency = DEFAULT_CURRENCY
): string {
  return isHidden ? '***' : formatMoney(amount, currency);
}
