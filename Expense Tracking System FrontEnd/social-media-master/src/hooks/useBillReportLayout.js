import { createReportLayoutHook } from "./useReportLayoutFactory";

// Default section configuration for Bill Report
const DEFAULT_SECTIONS = [
  {
    id: "overview-cards",
    name: "Overview Cards",
    visible: true,
    type: "full",
  },
  {
    id: "category-chart",
    name: "Expenses by Category",
    visible: true,
    type: "half",
  },
  {
    id: "payment-method-chart",
    name: "Payment Methods",
    visible: true,
    type: "half",
  },
  {
    id: "expense-trend",
    name: "Expense Trend",
    visible: true,
    type: "full",
  },
  {
    id: "top-items-radial",
    name: "Top Expense Items (Radial)",
    visible: true,
    type: "half",
  },
  {
    id: "top-items-bar",
    name: "Top Expense Items (Bar)",
    visible: true,
    type: "half",
  },
  {
    id: "bills-table",
    name: "Detailed Bills Table",
    visible: true,
    type: "full",
  },
  {
    id: "category-breakdown",
    name: "Category Breakdown",
    visible: true,
    type: "full",
  },
];

/**
 * useBillReportLayout - Manages bill report section layout configuration
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
const useBillReportLayout = createReportLayoutHook({
  storageKey: "bill_report_layout_config",
  apiEndpoint: "/api/user/bill-report-preferences",
  defaultSections: DEFAULT_SECTIONS,
  reportName: "Bill Report",
});

export default useBillReportLayout;
export { DEFAULT_SECTIONS as BILL_REPORT_DEFAULT_SECTIONS };
