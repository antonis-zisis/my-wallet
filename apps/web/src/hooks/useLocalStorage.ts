import { useCallback, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((previous: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      setStoredValue((previous) => {
        const next =
          typeof value === 'function'
            ? (value as (previous: T) => T)(previous)
            : value;

        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // localStorage unavailable (e.g. private browsing quota exceeded)
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
