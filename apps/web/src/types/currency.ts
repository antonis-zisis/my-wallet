export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

export type Currency = (typeof CURRENCIES)[number];

export type CurrencyConfig = {
  isSpaced: boolean;
  locale: string;
  name: string;
  symbol: string;
  symbolPosition: 'prefix' | 'suffix';
};

export const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  EUR: {
    isSpaced: true,
    locale: 'el-GR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'suffix',
  },
  USD: {
    isSpaced: false,
    locale: 'en-US',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'prefix',
  },
  GBP: {
    isSpaced: false,
    locale: 'en-GB',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'prefix',
  },
};

export const DEFAULT_CURRENCY: Currency = 'EUR';

export const CURRENCY_OPTIONS: Array<{ label: string; value: Currency }> =
  CURRENCIES.map((currency) => ({
    label: `${CURRENCY_CONFIG[currency].name} (${currency})`,
    value: currency,
  }));

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && CURRENCIES.includes(value as Currency);
}
