import { createReportLayoutHook } from "./useReportLayoutFactory";

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
const useExpenseReportLayout = createReportLayoutHook({
  storageKey: "expense_report_layout_config",
  apiEndpoint: "/api/user/expense-report-preferences",
  defaultSections: DEFAULT_SECTIONS,
  reportName: "Expense Report",
});

export default useExpenseReportLayout;
export { DEFAULT_SECTIONS as EXPENSE_REPORT_DEFAULT_SECTIONS };
