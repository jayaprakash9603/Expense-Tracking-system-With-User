import { createReportLayoutHook } from "./useReportLayoutFactory";

// Default section configuration for Category Report
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
    id: "usage-analysis",
    name: "Usage Analysis",
    visible: true,
    type: "full",
  },
  {
    id: "category-distribution",
    name: "Category Distribution",
    visible: true,
    type: "full",
  },
  {
    id: "category-accordion",
    name: "Category Expenses",
    visible: true,
    type: "full",
  },
];

/**
 * useCategoryReportLayout - Manages category report section layout configuration
 *
 * Uses the report layout factory for consistent implementation across all reports.
 * Saves layout preferences to both localStorage and backend for persistence.
 *
 * @returns {Object} Layout configuration and methods
 * @returns {Array} returns.sections - All sections with visibility state
 * @returns {Array} returns.visibleSections - Only visible sections in order
 * @returns {boolean} returns.isLoaded - Whether initial data is loaded
 * @returns {boolean} returns.isSaving - Whether currently saving
 * @returns {Function} returns.toggleSection - Toggle section visibility
 * @returns {Function} returns.reorderSections - Reorder sections
 * @returns {Function} returns.saveLayout - Save current layout
 * @returns {Function} returns.resetLayout - Reset to default layout
 */
const useCategoryReportLayout = createReportLayoutHook({
  storageKey: "category_report_layout_config",
  apiEndpoint: "/api/user/category-report-preferences",
  defaultSections: DEFAULT_SECTIONS,
  reportName: "Category Report",
});

export default useCategoryReportLayout;
export { DEFAULT_SECTIONS as CATEGORY_REPORT_DEFAULT_SECTIONS };
