import { createReportLayoutHook } from "./useReportLayoutFactory";

// Default section configuration for Budget Report
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
    id: "recurring-expenses",
    name: "Top Recurring Expenses",
    visible: true,
    type: "half",
  },
  {
    id: "loss-gain-breakdown",
    name: "Loss/Gain Breakdown",
    visible: true,
    type: "half",
  },
  {
    id: "category-distribution",
    name: "Category Distribution",
    visible: true,
    type: "full",
  },
  {
    id: "payment-distribution",
    name: "Payment Method Distribution",
    visible: true,
    type: "full",
  },
  {
    id: "budget-overview-grid",
    name: "Budget Overview Grid",
    visible: true,
    type: "full",
  },
  {
    id: "budget-accordion",
    name: "Individual Budget Details",
    visible: true,
    type: "full",
  },
];

/**
 * useBudgetReportLayout - Manages budget report section layout configuration
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
const useBudgetReportLayout = createReportLayoutHook({
  storageKey: "budget_report_layout_config",
  apiEndpoint: "/api/user/budget-report-preferences",
  defaultSections: DEFAULT_SECTIONS,
  reportName: "Budget Report",
});

export default useBudgetReportLayout;
export { DEFAULT_SECTIONS as BUDGET_REPORT_DEFAULT_SECTIONS };
