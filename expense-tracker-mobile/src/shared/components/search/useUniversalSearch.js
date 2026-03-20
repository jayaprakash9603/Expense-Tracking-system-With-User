import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/shared/hooks/utility/useDebounce";

const EMPTY_SECTIONS = [];

export function useUniversalSearch({
  searchFn,
  sections = EMPTY_SECTIONS,
  debounceMs = 300,
  enableGlobalHotkey = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setLoading((prev) => (prev ? false : prev));
      return;
    }

    let cancelled = false;
    setLoading(true);

    const doSearch = async () => {
      try {
        if (searchFn) {
          const res = await searchFn(debouncedQuery);
          if (!cancelled) setResults(res || []);
        } else {
          const lower = debouncedQuery.toLowerCase();
          const matched = sections.flatMap((section) => {
            const items = (section.items || []).filter((item) =>
              String(item.label || item.name || "")
                .toLowerCase()
                .includes(lower),
            );
            if (items.length === 0) return [];
            return [{ ...section, items }];
          });
          if (!cancelled) setResults(matched);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchFn, sections]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery("");
    setResults([]);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!enableGlobalHotkey) return undefined;

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableGlobalHotkey]);

  const hasResults = results.length > 0;
  const isEmpty = debouncedQuery.trim().length > 0 && !loading && !hasResults;

  return {
    open,
    setOpen,
    query,
    setQuery,
    results,
    loading,
    hasResults,
    isEmpty,
    openSearch,
    closeSearch,
  };
}

export default useUniversalSearch;
