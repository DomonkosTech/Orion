import { useState, useEffect } from 'react';

/**
 * A custom hook that returns a debounced version of the provided value.
 * Useful for delaying execution of a function (like an API call or search)
 * until after a specified delay has passed since the last time the value changed.
 *
 * @param value The value to be debounced.
 * @param delay The delay in milliseconds (default: 500ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes (or the component unmounts)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
