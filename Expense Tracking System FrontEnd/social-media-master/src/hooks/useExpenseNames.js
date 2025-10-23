/**
 * useExpenseNames.js
 * Custom hook for managing expense/bill name suggestions
 *
 * Purpose: Fetches and manages expense/bill name data from API internally.
 * Provides processed, deduplicated names with filtering and caching.
 *
 * Features:
 * - Automatic API fetching with caching
 * - Deduplication and normalization
 * - Real-time filtering by input value
 * - Loading and error states
 * - Manual refetch capability
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExpensesSuggestions } from "../Redux/Expenses/expense.action";
import {
  processNameData,
  deduplicateNames,
  getSuggestions,
} from "../utils/nameUtils";

/**
 * useExpenseNames hook
 *
 * @param {string} friendId - Optional friend ID for fetching friend-specific names
 * @param {boolean} autofetch - Whether to automatically fetch data on mount (default: true)
 * @param {number} maxSuggestions - Maximum number of suggestions to return (default: 50)
 * @returns {object} Hook state and methods
 */
const useExpenseNames = (
  friendId = "",
  autofetch = true,
  maxSuggestions = 50
) => {
  const dispatch = useDispatch();
  const [hasFetched, setHasFetched] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Get data from Redux store
  const {
    topExpenses = [],
    loading: apiLoading,
    error: apiError,
  } = useSelector((state) => state.expenses || {});

  /**
   * Fetch expense names from API
   */
  const fetchNames = useCallback(() => {
    if (!hasFetched) {
      dispatch(getExpensesSuggestions(friendId || ""));
      setHasFetched(true);
    }
  }, [dispatch, friendId, hasFetched]);

  /**
   * Manual refetch (clears cache and fetches again)
   */
  const refetch = useCallback(() => {
    setHasFetched(false);
    dispatch(getExpensesSuggestions(friendId || ""));
    setHasFetched(true);
  }, [dispatch, friendId]);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autofetch && !hasFetched) {
      fetchNames();
    }
  }, [autofetch, fetchNames, hasFetched]);

  /**
   * Process raw API data into clean, deduplicated names
   */
  const allNames = useMemo(() => {
    if (!Array.isArray(topExpenses)) return [];

    // Extract names from various formats
    const extracted = topExpenses
      .map((item) => {
        if (typeof item === "string") {
          return item;
        } else if (item && typeof item === "object") {
          return item.name || item.expenseName || item.billName || "";
        }
        return "";
      })
      .filter((name) => name && name.trim() !== "");

    // Deduplicate names (case-insensitive)
    return deduplicateNames(extracted);
  }, [topExpenses]);

  /**
   * Get filtered suggestions based on input value
   */
  const filteredSuggestions = useMemo(() => {
    return getSuggestions(allNames, inputValue, maxSuggestions);
  }, [allNames, inputValue, maxSuggestions]);

  /**
   * Update input value for filtering
   */
  const handleInputChange = useCallback((value) => {
    setInputValue(value || "");
  }, []);

  /**
   * Fetch on demand (lazy loading)
   */
  const fetchIfNeeded = useCallback(() => {
    if (!hasFetched) {
      fetchNames();
    }
  }, [hasFetched, fetchNames]);

  return {
    // Processed data
    names: allNames, // All unique names
    suggestions: filteredSuggestions, // Filtered suggestions based on input

    // State
    loading: apiLoading && !hasFetched, // Loading only on first fetch
    error: apiError,
    hasFetched,
    inputValue,

    // Methods
    setInputValue: handleInputChange,
    fetchNames: fetchIfNeeded,
    refetch,
  };
};

export default useExpenseNames;
