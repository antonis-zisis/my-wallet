import { createContext, type ReactNode, useContext, useEffect } from 'react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  type Currency,
  CURRENCY_CONFIG,
  DEFAULT_CURRENCY,
  isCurrency,
} from '../types/currency';
import { useUser } from './UserContext';

type CurrencyContextType = {
  currency: Currency;
  symbol: string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  symbol: CURRENCY_CONFIG[DEFAULT_CURRENCY].symbol,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [cachedCurrency, setCachedCurrency] = useLocalStorage<Currency>(
    'currency',
    DEFAULT_CURRENCY
  );

  const serverCurrency = isCurrency(user?.currency) ? user.currency : null;

  useEffect(() => {
    if (serverCurrency && serverCurrency !== cachedCurrency) {
      setCachedCurrency(serverCurrency);
    }
  }, [cachedCurrency, serverCurrency, setCachedCurrency]);

  const currency = serverCurrency ?? cachedCurrency;

  return (
    <CurrencyContext.Provider
      value={{ currency, symbol: CURRENCY_CONFIG[currency].symbol }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
