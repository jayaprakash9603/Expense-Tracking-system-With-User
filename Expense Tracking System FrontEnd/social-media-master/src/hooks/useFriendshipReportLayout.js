import { createReportLayoutHook } from "./useReportLayoutFactory";

// Default section configuration for Friendship Report
const DEFAULT_SECTIONS = [
  {
    id: "overview-cards",
    name: "Overview Cards",
    visible: true,
    type: "full",
  },
  {
    id: "access-level-chart",
    name: "Access Level Distribution",
    visible: true,
    type: "half",
  },
  {
    id: "activity-chart",
    name: "Friendship Activity",
    visible: true,
    type: "half",
  },
  {
    id: "sharing-status-chart",
    name: "Sharing Status Overview",
    visible: true,
    type: "half",
  },
  {
    id: "top-friends-chart",
    name: "Top Active Friends",
    visible: true,
    type: "half",
  },
  {
    id: "friends-table",
    name: "Friends Overview Table",
    visible: true,
    type: "full",
  },
];

/**
 * useFriendshipReportLayout - Manages friendship report section layout configuration
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
const useFriendshipReportLayout = createReportLayoutHook({
  storageKey: "friendship_report_layout_config",
  apiEndpoint: "/api/user/friendship-report-preferences",
  defaultSections: DEFAULT_SECTIONS,
  reportName: "Friendship Report",
});

export default useFriendshipReportLayout;
export { DEFAULT_SECTIONS as FRIENDSHIP_REPORT_DEFAULT_SECTIONS };
