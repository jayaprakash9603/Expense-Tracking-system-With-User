/**
 * Keyboard Shortcuts Module - Public API
 *
 * This module provides a universal keyboard shortcut system for the
 * Expense Tracking Application. Import from this index file for clean imports.
 *
 * Usage:
 * ```
 * import {
 *   KeyboardShortcutProvider,
 *   useKeyboardShortcut,
 *   ShortcutGuideModal,
 *   ShortcutHint
 * } from '@/features/keyboard';
 * ```
 */

// Provider - wrap at app root
export {
  KeyboardShortcutProvider,
  useKeyboardShortcuts,
  SCOPE_PRIORITY,
} from "./KeyboardShortcutProvider";

// Registry class
export { ShortcutRegistry } from "./ShortcutRegistry";

// Hooks
export {
  useKeyboardShortcut,
  useMultipleShortcuts,
  useShortcutScope,
  useActionTracking,
  useTrackedAction,
  useShortcutHint,
  useIsShortcutActive,
  formatShortcutKeys,
} from "./useKeyboardShortcut";

// Component-level shortcut hooks
export {
  useComponentShortcuts,
  useTableShortcuts,
  useFormShortcuts,
  useModalShortcuts,
} from "./useComponentShortcuts";

// Recommendations
export {
  useShortcutRecommendations,
  ShortcutRecommendationToast,
} from "./useShortcutRecommendations";

// UI Components
export { ShortcutGuideModal } from "./ShortcutGuideModal";
export {
  ShortcutHint,
  ShortcutBadge,
  WithShortcutTooltip,
} from "./ShortcutHint";
export { GlobalShortcuts } from "./GlobalShortcuts";
export { RecommendationToast } from "./RecommendationToast";
export { AltKeyOverlay } from "./AltKeyOverlay";

// Definitions
export {
  DEFAULT_SHORTCUTS,
  RESERVED_SHORTCUTS,
  SHORTCUT_CATEGORIES,
  SHORTCUT_PRIORITY,
  getAllDefaultShortcuts,
  getShortcutsByCategory,
  getShortcutById,
  isReserved,
} from "./shortcutDefinitions";
