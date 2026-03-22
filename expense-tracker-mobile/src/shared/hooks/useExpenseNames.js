import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/config/api";
import { expenseApi } from "@/infrastructure/api";
import {
  deduplicateNames,
  getSuggestions,
} from "@/shared/utils/expense/expenseNameUtils";
import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";

function buildSuggestionPayload(friendId, topN) {
  return {
    topN: Number(topN) || 500,
    targetId: friendId || "",
  };
}

async function fetchExpenseNamesFromApi(friendId, topN) {
  const payload = buildSuggestionPayload(friendId, topN);
  const postResult = await expenseApi.getSuggestions(payload);
  if (!postResult.error) {
    return normalizeApiList(postResult.data, "data", "items", "topExpenses");
  }

  const response = await api.get("/api/expenses/top-expense-names", { params: payload });
  return normalizeApiList(response.data, "data", "items", "topExpenses");
}

function normalizeSuggestionName(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  return item.name || item.expenseName || item.billName || "";
}

export function useExpenseNames(
  friendId = "",
  autofetch = true,
  maxSuggestions = 50,
) {
  const [hasFetched, setHasFetched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNames = useCallback(
    async (force = false) => {
      if (!force && hasFetched) return;
      setLoading(true);
      setError(null);
      try {
        const responseNames = await fetchExpenseNamesFromApi(friendId, 500);
        const normalized = responseNames
          .map(normalizeSuggestionName)
          .filter(Boolean);
        setNames(deduplicateNames(normalized));
        setHasFetched(true);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch expense names",
        );
      } finally {
        setLoading(false);
      }
    },
    [friendId, hasFetched],
  );

  const refetch = useCallback(async () => {
    setHasFetched(false);
    await fetchNames(true);
  }, [fetchNames]);

  useEffect(() => {
    setNames([]);
    setInputValue("");
    setError(null);
    setHasFetched(false);
  }, [friendId]);

  useEffect(() => {
    if (autofetch && !hasFetched) {
      fetchNames();
    }
  }, [autofetch, hasFetched, fetchNames]);

  const suggestions = useMemo(
    () => getSuggestions(names, inputValue, maxSuggestions),
    [names, inputValue, maxSuggestions],
  );

  return {
    names,
    suggestions,
    loading,
    error,
    hasFetched,
    inputValue,
    setInputValue,
    fetchNames,
    refetch,
  };
}

export default useExpenseNames;
