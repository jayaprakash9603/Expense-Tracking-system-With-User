import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dashboard_layout_config';

// Default section configuration
const DEFAULT_SECTIONS = [
  { id: 'metrics', name: 'Key Metrics', visible: true, type: 'full' },
  { id: 'daily-spending', name: 'Daily Spending', visible: true, type: 'full' },
  { id: 'quick-access', name: 'Quick Access', visible: true, type: 'full' },
  { id: 'summary-overview', name: 'Summary Overview', visible: true, type: 'half' },
  { id: 'category-breakdown', name: 'Category Breakdown', visible: true, type: 'half' },
  { id: 'monthly-trend', name: 'Monthly Trend', visible: true, type: 'half' },
  { id: 'payment-methods', name: 'Payment Methods', visible: true, type: 'half' },
  { id: 'recent-transactions', name: 'Recent Transactions', visible: true, type: 'bottom' },
  { id: 'budget-overview', name: 'Budget Overview', visible: true, type: 'bottom' },
];

export function useDashboardLayout() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new sections
        const merged = DEFAULT_SECTIONS.map(defaultSection => {
          const stored = parsed.find(s => s.id === defaultSection.id);
          return stored ? { ...defaultSection, ...stored } : defaultSection;
        });
        setSections(merged);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever sections change
  const saveLayout = useCallback((newSections) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      setSections(newSections);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback((sectionId) => {
    setSections(current => {
      const updated = current.map(section =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      );
      saveLayout(updated);
      return updated;
    });
  }, [saveLayout]);

  // Reorder sections (for drag-and-drop)
  const reorderSections = useCallback((startIndex, endIndex) => {
    setSections(current => {
      const result = Array.from(current);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      saveLayout(result);
      return result;
    });
  }, [saveLayout]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSections(DEFAULT_SECTIONS);
    } catch (error) {
      console.error('Failed to reset dashboard layout:', error);
    }
  }, []);

  // Get visible sections only
  const visibleSections = sections.filter(s => s.visible);

  // Get sections by type for organized rendering
  const getFullWidthSections = () => visibleSections.filter(s => s.type === 'full');
  const getHalfWidthSections = () => visibleSections.filter(s => s.type === 'half');
  const getBottomSections = () => visibleSections.filter(s => s.type === 'bottom');

  return {
    sections,
    visibleSections,
    isLoaded,
    toggleSection,
    reorderSections,
    resetLayout,
    saveLayout,
    getFullWidthSections,
    getHalfWidthSections,
    getBottomSections,
  };
}
