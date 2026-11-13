import { useState, useEffect } from 'react';

/**
 * Custom debounce hook with a default threshold of 280ms
 * for rapid responsive autocomplete queries while avoiding rate limits.
 */
export function useDebounce<T>(value: T, delayMs: number = 280): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
