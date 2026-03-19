import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debouncedFn;
}

export function useDebouncedSearch(initialValue = "", delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const isSearching = useMemo(
    () => searchTerm !== debouncedSearchTerm,
    [searchTerm, debouncedSearchTerm]
  );

  const clearSearch = useCallback(() => setSearchTerm(""), []);

  return { searchTerm, setSearchTerm, debouncedSearchTerm, isSearching, clearSearch };
}

export default useDebounce;
