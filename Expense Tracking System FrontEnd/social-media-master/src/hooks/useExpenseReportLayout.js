import { useState, useEffect, useCallback } from "react";
import { api } from "../config/api";

const STORAGE_KEY = "expense_report_layout_config";

// Default section configuration for Expense Report
const DEFAULT_SECTIONS = [
  {
    id: "overview-cards",
    name: "Overview Cards",
    visible: true,
    type: "full",
  },
  {
    id: "daily-spending",
    name: "Daily Spending Pattern",
    visible: true,
    type: "full",
  },
  {
    id: "category-breakdown",
    name: "Category Breakdown",
    visible: true,
    type: "half",
  },
  {
    id: "payment-methods",
    name: "Payment Methods",
    visible: true,
    type: "half",
  },
  {
    id: "expenses-accordion",
    name: "Grouped Expenses",
    visible: true,
    type: "full",
  },
];

/**
 * useExpenseReportLayout - Manages expense report section layout configuration
 * Similar to useDashboardLayout but for the Combined Expense Report page
 *
 * Saves layout preferences to both localStorage and backend for persistence
 */
export function useExpenseReportLayout() {
  const [sections, setSections] = useState(() => {
    // Initialize from localStorage immediately
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Preserve the saved order: iterate over parsed (saved) sections first
        const merged = parsed.map((savedSection) => {
          const defaultSection = DEFAULT_SECTIONS.find(
            (s) => s.id === savedSection.id
          );
          return defaultSection
            ? { ...defaultSection, ...savedSection }
            : savedSection;
        });
        // Add any new default sections that aren't in the saved config
        DEFAULT_SECTIONS.forEach((defaultSection) => {
          if (!merged.find((s) => s.id === defaultSection.id)) {
            merged.push(defaultSection);
          }
        });
        return merged;
      }
    } catch (error) {
      console.error("Failed to load initial expense report layout:", error);
    }
    return DEFAULT_SECTIONS;
  });

  const [isLoaded, setIsLoaded] = useState(true); // Already loaded from localStorage
  const [isSaving, setIsSaving] = useState(false);

  // Sync with backend on mount (fallback if localStorage is empty)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Only fetch from backend if localStorage is empty
      const loadFromBackend = async () => {
        try {
          const { data } = await api.get(
            "/api/user/expense-report-preferences"
          );
          if (data && data.layoutConfig) {
            const parsed = JSON.parse(data.layoutConfig);
            // Preserve the saved order from backend
            const merged = parsed.map((savedSection) => {
              const defaultSection = DEFAULT_SECTIONS.find(
                (s) => s.id === savedSection.id
              );
              return defaultSection
                ? { ...defaultSection, ...savedSection }
                : savedSection;
            });
            // Add any new default sections that aren't in the saved config
            DEFAULT_SECTIONS.forEach((defaultSection) => {
              if (!merged.find((s) => s.id === defaultSection.id)) {
                merged.push(defaultSection);
              }
            });
            setSections(merged);
            localStorage.setItem(STORAGE_KEY, data.layoutConfig);
            console.log(
              "Loaded expense report preferences from backend (fallback)"
            );
          }
        } catch (error) {
          console.error(
            "Failed to load expense report layout from backend:",
            error
          );
        }
      };
      loadFromBackend();
    }
  }, []);

  // Save to backend and localStorage
  const saveLayout = useCallback(async (newSections) => {
    setIsSaving(true);
    try {
      const layoutConfig = JSON.stringify(newSections);

      // Save to backend
      await api.post("/api/user/expense-report-preferences", layoutConfig, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, layoutConfig);

      setSections(newSections);
    } catch (error) {
      console.error("Failed to save expense report layout:", error);
      // Still update local state even if backend save fails
      setSections(newSections);
      // Keep localStorage backup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      } catch (localError) {
        console.error("Failed to save to localStorage:", localError);
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback(
    (sectionId) => {
      setSections((current) => {
        const updated = current.map((section) =>
          section.id === sectionId
            ? { ...section, visible: !section.visible }
            : section
        );
        saveLayout(updated);
        return updated;
      });
    },
    [saveLayout]
  );

  // Reorder sections (for drag-and-drop)
  const reorderSections = useCallback(
    (startIndex, endIndex) => {
      setSections((current) => {
        const result = Array.from(current);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        saveLayout(result);
        return result;
      });
    },
    [saveLayout]
  );

  // Reset to default layout
  const resetLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      // Delete from backend
      await api.delete("/api/user/expense-report-preferences");

      // Remove from localStorage
      localStorage.removeItem(STORAGE_KEY);

      setSections(DEFAULT_SECTIONS);
    } catch (error) {
      console.error("Failed to reset expense report layout:", error);
      // Still reset local state even if backend delete fails
      setSections(DEFAULT_SECTIONS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (localError) {
        console.error("Failed to remove from localStorage:", localError);
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Get visible sections only
  const visibleSections = sections.filter((s) => s.visible);

  // Get sections by type for organized rendering
  const getFullWidthSections = () =>
    visibleSections.filter((s) => s.type === "full");
  const getHalfWidthSections = () =>
    visibleSections.filter((s) => s.type === "half");

  return {
    sections,
    visibleSections,
    isLoaded,
    isSaving,
    toggleSection,
    reorderSections,
    resetLayout,
    saveLayout,
    getFullWidthSections,
    getHalfWidthSections,
  };
}

export default useExpenseReportLayout;
