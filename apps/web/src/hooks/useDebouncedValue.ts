import { useEffect, useState } from 'react';

/**
 * Debounces a fast-changing value (e.g. a search field) so dependent work —
 * GraphQL queries in particular — only fires once the value settles. Generic
 * and domain-agnostic, so it lives flat under hooks/. Consumed by the search
 * toolbars on Reports, Contracts, and Net Worth.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
