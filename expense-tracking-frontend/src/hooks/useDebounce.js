import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook to debounce a value. Returns the debounced value after the specified delay.
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function.
 * Useful for event handlers like search input onChange.
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} - The debounced callback
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook that provides both immediate and debounced search state.
 * - `inputValue` updates immediately for responsive UI
 * - `debouncedValue` updates after delay for expensive operations (API calls, filtering)
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {{ inputValue: string, debouncedValue: string, setInputValue: Function, clearSearch: Function }}
 */
export function useDebouncedSearch(initialValue = "", delay = 300) {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebounce(inputValue, delay);

  const clearSearch = useCallback(() => {
    setInputValue("");
  }, []);

  return {
    inputValue,
    debouncedValue,
    setInputValue,
    clearSearch,
  };
}

export default useDebounce;
