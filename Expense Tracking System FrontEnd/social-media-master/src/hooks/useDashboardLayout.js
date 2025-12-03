import { useState, useEffect, useCallback } from "react";
import { api } from "../config/api";

const STORAGE_KEY = "dashboard_layout_config";

// Default section configuration
const DEFAULT_SECTIONS = [
  { id: "metrics", name: "Key Metrics", visible: true, type: "full" },
  { id: "daily-spending", name: "Daily Spending", visible: true, type: "full" },
  { id: "quick-access", name: "Quick Access", visible: true, type: "full" },
  {
    id: "summary-overview",
    name: "Summary Overview",
    visible: true,
    type: "half",
  },
  {
    id: "category-breakdown",
    name: "Category Breakdown",
    visible: true,
    type: "half",
  },
  { id: "monthly-trend", name: "Monthly Trend", visible: true, type: "half" },
  {
    id: "payment-methods",
    name: "Payment Methods",
    visible: true,
    type: "half",
  },
  {
    id: "recent-transactions",
    name: "Recent Transactions",
    visible: true,
    type: "bottom",
  },
  {
    id: "budget-overview",
    name: "Budget Overview",
    visible: true,
    type: "bottom",
  },
];

export function useDashboardLayout() {
  const [sections, setSections] = useState(() => {
    // Initialize from localStorage immediately (preloaded in App.js)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = DEFAULT_SECTIONS.map((defaultSection) => {
          const stored = parsed.find((s) => s.id === defaultSection.id);
          return stored ? { ...defaultSection, ...stored } : defaultSection;
        });
        return merged;
      }
    } catch (error) {
      console.error("Failed to load initial dashboard layout:", error);
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
          const { data } = await api.get("/api/user/dashboard-preferences");
          if (data && data.layoutConfig) {
            const parsed = JSON.parse(data.layoutConfig);
            const merged = DEFAULT_SECTIONS.map((defaultSection) => {
              const stored = parsed.find((s) => s.id === defaultSection.id);
              return stored ? { ...defaultSection, ...stored } : defaultSection;
            });
            setSections(merged);
            localStorage.setItem(STORAGE_KEY, data.layoutConfig);
            console.log("Loaded dashboard preferences from backend (fallback)");
          }
        } catch (error) {
          console.error("Failed to load dashboard layout from backend:", error);
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
      await api.post("/api/user/dashboard-preferences", layoutConfig, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, layoutConfig);

      setSections(newSections);
    } catch (error) {
      console.error("Failed to save dashboard layout:", error);
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
      await api.delete("/api/user/dashboard-preferences");

      // Remove from localStorage
      localStorage.removeItem(STORAGE_KEY);

      setSections(DEFAULT_SECTIONS);
    } catch (error) {
      console.error("Failed to reset dashboard layout:", error);
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
  const getBottomSections = () =>
    visibleSections.filter((s) => s.type === "bottom");

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
    getBottomSections,
  };
}
