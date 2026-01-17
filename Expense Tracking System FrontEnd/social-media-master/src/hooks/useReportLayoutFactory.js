import { useState, useEffect, useCallback } from "react";
import { api } from "../config/api";

/**
 * createReportLayoutHook - Factory function for creating report layout hooks
 *
 * Follows DRY principle by providing a single implementation for all report layouts.
 * Each report can use this factory with its own configuration.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.storageKey - localStorage key for persistence
 * @param {string} config.apiEndpoint - Backend API endpoint for preferences
 * @param {Array} config.defaultSections - Default section configuration
 * @param {string} config.reportName - Name for logging purposes
 *
 * @returns {Function} Custom hook function for the specific report
 *
 * @example
 * const useMyReportLayout = createReportLayoutHook({
 *   storageKey: "my_report_layout_config",
 *   apiEndpoint: "/api/user/my-report-preferences",
 *   defaultSections: [...],
 *   reportName: "My Report"
 * });
 */
export function createReportLayoutHook({
  storageKey,
  apiEndpoint,
  defaultSections,
  reportName = "Report",
}) {
  return function useReportLayout() {
    const [sections, setSections] = useState(() => {
      // Initialize from localStorage immediately
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Preserve the saved order: iterate over parsed (saved) sections first
          const merged = parsed.map((savedSection) => {
            const defaultSection = defaultSections.find(
              (s) => s.id === savedSection.id
            );
            return defaultSection
              ? { ...defaultSection, ...savedSection }
              : savedSection;
          });
          // Add any new default sections that aren't in the saved config
          defaultSections.forEach((defaultSection) => {
            if (!merged.find((s) => s.id === defaultSection.id)) {
              merged.push(defaultSection);
            }
          });
          return merged;
        }
      } catch (error) {
        console.error(`Failed to load initial ${reportName} layout:`, error);
      }
      return defaultSections;
    });

    const [isLoaded, setIsLoaded] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with backend on mount (fallback if localStorage is empty)
    useEffect(() => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        const loadFromBackend = async () => {
          try {
            const { data } = await api.get(apiEndpoint);
            if (data && data.layoutConfig) {
              const parsed = JSON.parse(data.layoutConfig);
              const merged = parsed.map((savedSection) => {
                const defaultSection = defaultSections.find(
                  (s) => s.id === savedSection.id
                );
                return defaultSection
                  ? { ...defaultSection, ...savedSection }
                  : savedSection;
              });
              defaultSections.forEach((defaultSection) => {
                if (!merged.find((s) => s.id === defaultSection.id)) {
                  merged.push(defaultSection);
                }
              });
              setSections(merged);
              localStorage.setItem(storageKey, data.layoutConfig);
              console.log(
                `Loaded ${reportName} preferences from backend (fallback)`
              );
            }
          } catch (error) {
            console.error(
              `Failed to load ${reportName} layout from backend:`,
              error
            );
          }
        };
        loadFromBackend();
      }
    }, []);

    // Save to backend and localStorage
    const saveLayout = useCallback(
      async (newSections) => {
        setIsSaving(true);
        try {
          const layoutConfig = JSON.stringify(newSections);

          await api.post(apiEndpoint, layoutConfig, {
            headers: { "Content-Type": "text/plain" },
          });

          localStorage.setItem(storageKey, layoutConfig);
          setSections(newSections);
        } catch (error) {
          console.error(`Failed to save ${reportName} layout:`, error);
          setSections(newSections);
          try {
            localStorage.setItem(storageKey, JSON.stringify(newSections));
          } catch (localError) {
            console.error("Failed to save to localStorage:", localError);
          }
        } finally {
          setIsSaving(false);
        }
      },
      [apiEndpoint]
    );

    // Toggle section visibility
    const toggleSection = useCallback((sectionId) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? { ...section, visible: !section.visible }
            : section
        )
      );
    }, []);

    // Reorder sections
    const reorderSections = useCallback((newOrder) => {
      setSections(newOrder);
    }, []);

    // Reset to default layout
    const resetLayout = useCallback(async () => {
      setIsSaving(true);
      try {
        await api.delete(apiEndpoint);
        localStorage.removeItem(storageKey);
        setSections(defaultSections);
        console.log(`Reset ${reportName} layout to default`);
      } catch (error) {
        console.error(`Failed to reset ${reportName} layout:`, error);
        setSections(defaultSections);
        localStorage.removeItem(storageKey);
      } finally {
        setIsSaving(false);
      }
    }, []);

    // Computed visible sections (preserving order)
    const visibleSections = sections.filter((s) => s.visible);

    return {
      sections,
      visibleSections,
      isLoaded,
      isSaving,
      toggleSection,
      reorderSections,
      saveLayout,
      resetLayout,
    };
  };
}

export default createReportLayoutHook;
