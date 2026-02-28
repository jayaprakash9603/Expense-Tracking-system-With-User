/**
 * UniversalSearch Component
 *
 * A global search bar that allows users to search across multiple domains
 * including expenses, budgets, categories, bills, payment methods, and quick actions.
 *
 * Features:
 * - Keyboard shortcut: Cmd/Ctrl + K to open
 * - Fuzzy search for local quick actions
 * - Debounced API search for backend data
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Grouped results by section
 * - Highlighted matched text
 * - Mobile-friendly responsive design
 *
 * Usage:
 * 1. Import and add <UniversalSearchModal /> at the app root level
 * 2. Import useUniversalSearch hook for programmatic control
 * 3. Use SearchTriggerButton for a clickable trigger in the header
 */

export { default as UniversalSearchModal } from "./UniversalSearchModal";
export { default as SearchResultItem } from "./SearchResultItem";
export { default as useUniversalSearch } from "./useUniversalSearch";
export { default as SearchTriggerButton } from "./SearchTriggerButton";
export { default as InlineSearchBar } from "./InlineSearchBar";

// Config exports
export {
  QUICK_ACTIONS,
  SEARCH_TYPES,
  TYPE_ICONS,
  SECTION_ORDER,
  SECTION_LABELS,
  searchQuickActions,
  getRouteForResult,
  fuzzyMatch,
} from "./quickActions.config";
