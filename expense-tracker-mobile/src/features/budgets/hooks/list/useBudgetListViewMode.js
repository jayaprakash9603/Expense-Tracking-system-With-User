import { useState, useEffect } from "react";

const STORAGE_KEY = "budgets:listViewMode";

export function useBudgetListViewMode() {
  const [mode, setMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "overview" || stored === "analytics") return stored;
    } catch {
      /* ignore */
    }
    return "analytics";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  return [mode, setMode];
}
