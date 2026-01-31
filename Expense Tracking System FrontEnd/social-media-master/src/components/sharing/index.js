/**
 * =============================================================================
 * Sharing Components Index
 * =============================================================================
 *
 * Central export point for all sharing-related components.
 * This allows clean imports like:
 * import { ShareCard, AccessLevelBadge, SharesPageSkeleton } from "../../components/sharing";
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

// Main Components
export { default as ShareModal } from "./ShareModal";
export { default as QrDisplayScreen } from "./QrDisplayScreen";
export { default as ShareButton } from "./ShareButton";
export { default as ShareWithFriendModal } from "./ShareWithFriendModal";
export {
  default as ShareCard,
  getShareStatus,
  formatDate,
  getTimeRemaining,
  STATUS_COLORS,
  RESOURCE_ICONS,
} from "./ShareCard";
export { default as SharesPageLayout } from "./SharesPageLayout";
export {
  default as SharesPageSkeleton,
  StatCardSkeleton,
  ShareCardSkeleton,
  ToolbarSkeleton,
  HeaderSkeleton,
} from "./SharesPageSkeleton";
export {
  default as AccessLevelBadge,
  AccessLevelLegend,
  compareAccessLevels,
  getPermissions,
} from "./AccessLevelBadge";

// Utility Components
export { default as StatsCard } from "./StatsCard";
export { default as EmptyState } from "./EmptyState";
