import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExpensesSuggestions } from "../Redux/Expenses/expense.action";
import { useParams } from "react-router-dom";

/**
 * useExpenseNameSuggestions
 * Fetches top expense/bill names and provides filtered suggestions.
 * Returns { suggestions, allNames, loading, fetchIfNeeded, filterNames }
 */
export default function useExpenseNameSuggestions({ autoFetch = true } = {}) {
  const dispatch = useDispatch();
  const { friendId } = useParams();
  const { topExpenses = [], loading: globalLoading } = useSelector(
    (state) => state.expenses || {}
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (autoFetch && !hasFetched) {
      dispatch(getExpensesSuggestions(friendId || ""));
      setHasFetched(true);
    }
  }, [autoFetch, hasFetched, dispatch, friendId]);

  // Normalize the names array to strings only
  const allNames = useMemo(() => {
    if (!Array.isArray(topExpenses)) return [];
    return topExpenses
      .map((item) => (typeof item === "string" ? item : item?.name || ""))
      .filter((s) => s && s.trim() !== "");
  }, [topExpenses]);

  const suggestions = useMemo(() => {
    if (!inputValue) return allNames.slice(0, 50); // show top slice on focus
    const lower = inputValue.toLowerCase();
    return allNames.filter((n) => n.toLowerCase().includes(lower));
  }, [inputValue, allNames]);

  const filterNames = (value) => setInputValue(value || "");

  const fetchIfNeeded = () => {
    if (!hasFetched) {
      dispatch(getExpensesSuggestions(friendId || ""));
      setHasFetched(true);
    }
  };

  return {
    suggestions,
    allNames,
    loading: globalLoading && !hasFetched,
    inputValue,
    setInputValue: filterNames,
    fetchIfNeeded,
  };
}
