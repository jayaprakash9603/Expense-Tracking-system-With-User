import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../Redux/Category/categoryActions";
import { deduplicateCategories } from "../utils/categoryUtils";

/**
 * useCategories - Custom hook for category data management
 *
 * Features:
 * - Automatic category fetching
 * - Deduplication
 * - Loading and error states
 * - Memoized results
 *
 * @param {string} friendId - Optional friend ID for friend-specific categories
 * @param {boolean} autofetch - Whether to automatically fetch categories on mount (default: true)
 * @returns {Object} - { categories, uniqueCategories, loading, error, refetch }
 */
const useCategories = (friendId = "", autofetch = true) => {
  const dispatch = useDispatch();

  // Get categories from Redux store
  const {
    categories: rawCategories = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.categories || {});

  // Fetch categories on mount or when friendId changes
  useEffect(() => {
    if (autofetch) {
      dispatch(fetchCategories(friendId || ""));
    }
  }, [dispatch, friendId, autofetch]);

  // Deduplicate categories (memoized)
  const uniqueCategories = useMemo(() => {
    return deduplicateCategories(rawCategories);
  }, [rawCategories]);

  // Refetch function
  const refetch = () => {
    dispatch(fetchCategories(friendId || ""));
  };

  return {
    categories: rawCategories,
    uniqueCategories,
    loading,
    error,
    refetch,
  };
};

export default useCategories;
