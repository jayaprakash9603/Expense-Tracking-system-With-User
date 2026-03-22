import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "dashboard_layout_config";

const DEFAULT_SECTIONS = [
  { id: "metrics", name: "Key Metrics", visible: true, type: "full" },
  { id: "daily-spending", name: "Daily Spending", visible: true, type: "full" },
  { id: "quick-access", name: "Quick Access", visible: true, type: "full" },
  { id: "summary-overview", name: "Summary Overview", visible: true, type: "half" },
  { id: "category-breakdown", name: "Category Breakdown", visible: true, type: "half" },
  { id: "monthly-trend", name: "Monthly Trend", visible: true, type: "half" },
  { id: "payment-methods", name: "Payment Methods", visible: true, type: "half" },
  { id: "recent-transactions", name: "Recent Transactions", visible: true, type: "bottom" },
  { id: "budget-overview", name: "Budget Overview", visible: true, type: "bottom" },
];

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SECTIONS;
    const parsed = JSON.parse(stored);
    const merged = parsed.map((saved) => {
      const def = DEFAULT_SECTIONS.find((d) => d.id === saved.id);
      return def ? { ...def, ...saved } : saved;
    });
    DEFAULT_SECTIONS.forEach((def) => {
      if (!merged.find((s) => s.id === def.id)) merged.push(def);
    });
    return merged;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export function useDashboardLayout() {
  const [sections, setSections] = useState(loadFromStorage);

  const saveLayout = useCallback((newSections) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
    } catch { /* silent */ }
    setSections(newSections);
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setSections((cur) => {
      const updated = cur.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      );
      saveLayout(updated);
      return updated;
    });
  }, [saveLayout]);

  const reorderSections = useCallback((startIdx, endIdx) => {
    setSections((cur) => {
      const result = [...cur];
      const [removed] = result.splice(startIdx, 1);
      result.splice(endIdx, 0, removed);
      saveLayout(result);
      return result;
    });
  }, [saveLayout]);

  const resetLayout = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
    setSections(DEFAULT_SECTIONS);
  }, []);

  const visibleSections = useMemo(() => sections.filter((s) => s.visible), [sections]);

  return {
    sections,
    visibleSections,
    toggleSection,
    reorderSections,
    resetLayout,
    saveLayout,
  };
}

export default useDashboardLayout;
