import { useState, useEffect } from "react";
import { expenseApi } from "@/infrastructure/api";

export function usePreviousExpense(
  name,
  date,
  friendId = "",
  minNameLength = 2,
  debounceDelay = 500,
) {
  const [previousExpense, setPreviousExpense] = useState(null);
  const [loadingPreviousExpense, setLoadingPreviousExpense] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      const trimmedName = String(name || "").trim();
      if (trimmedName.length < minNameLength || !date) {
        if (isMounted) {
          setPreviousExpense(null);
          setLoadingPreviousExpense(false);
        }
        return;
      }

      if (isMounted) {
        setLoadingPreviousExpense(true);
      }
      const { data, error } = await expenseApi.getPrevious(trimmedName, date, friendId);
      if (!isMounted) return;
      if (error) {
        setPreviousExpense(null);
      } else {
        setPreviousExpense(data || null);
      }
      setLoadingPreviousExpense(false);
    }, debounceDelay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [name, date, friendId, minNameLength, debounceDelay]);

  return {
    previousExpense,
    loadingPreviousExpense,
  };
}

export default usePreviousExpense;
