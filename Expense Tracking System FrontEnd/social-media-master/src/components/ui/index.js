/**
 * UI Component Library - Central Export
 *
 * This is the single source of truth for all reusable MUI wrapper components.
 * Import components from here instead of directly from @mui/material.
 *
 * @example
 * import { PrimaryButton, AppTextField, ConfirmDialog } from '../components/ui';
 *
 * Benefits:
 * - Consistent theming across the application
 * - Centralized styling changes propagate everywhere
 * - Semantic variants reduce decision fatigue
 * - TypeScript-like prop validation via PropTypes
 */

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================
// Base button with full customization
export { AppButton } from "./Button";
// Semantic button variants - use these for common cases
export { PrimaryButton } from "./Button"; // Main actions: Save, Submit, Confirm
export { SecondaryButton } from "./Button"; // Secondary actions: Cancel, Back
export { DangerButton } from "./Button"; // Destructive actions: Delete, Remove
export { GhostButton } from "./Button"; // Tertiary actions: Links, "Learn more"
// Icon button with tooltip support
export { AppIconButton } from "./Button";

// ============================================================================
// TEXT FIELD COMPONENTS
// ============================================================================
// Base text input with theme support
export { AppTextField } from "./TextField";
// Semantic variant with search icon
export { SearchField } from "./TextField";

// ============================================================================
// DIALOG COMPONENTS
// ============================================================================
// Base dialog with flexible content
export { AppDialog } from "./Dialog";
// Semantic dialog variants
export { ConfirmDialog } from "./Dialog"; // Confirmation prompts
export { DeleteDialog } from "./Dialog"; // Delete confirmations

// ============================================================================
// CHIP COMPONENTS
// ============================================================================
// Base chip with theme support
export { AppChip } from "./Chip";
// Semantic chip variants
export { StatusChip } from "./Chip"; // Status badges (success, warning, error)
export { CategoryChip } from "./Chip"; // Category tags

// ============================================================================
// SELECT COMPONENTS
// ============================================================================
// Dropdown select
export { AppSelect } from "./Select";
// Autocomplete with search/filter
export { AppAutocomplete } from "./Select";

// ============================================================================
// CARD COMPONENTS
// ============================================================================
// Base card with flexible layout
export { AppCard } from "./Card";
// Semantic card variants
export { StatsCard } from "./Card"; // Dashboard statistics

// ============================================================================
// PROGRESS COMPONENTS
// ============================================================================
// Circular loader/progress
export { AppCircularProgress } from "./Progress";
// Linear progress bar
export { AppLinearProgress } from "./Progress";

// ============================================================================
// ACCORDION COMPONENTS
// ============================================================================
// Base accordion with theme support
export { AppAccordion } from "./Accordion";
// Controlled accordion group
export { AccordionGroup } from "./Accordion";

// ============================================================================
// TOAST / SNACKBAR COMPONENTS
// ============================================================================
// Rich toast notification with progress bar
export { AppToast } from "./Toast";
// Simple MUI Alert-based snackbar
export { AppSnackbar } from "./Toast";
// Hook for managing toast state
export { useToast } from "./Toast";

// ============================================================================
// MODAL COMPONENTS
// ============================================================================
// Base modal with flexible content
export { AppModal } from "./Modal";
// Form modal with save/cancel actions
export { FormModal } from "./Modal";
// Confirmation dialog with approve/decline
export { ConfirmationModal } from "./Modal";

// ============================================================================
// TABLE COMPONENTS
// ============================================================================
// Simple sortable table
export { AppTable } from "./Table";
// Data table with search, filter, pagination
export { AppDataTable } from "./Table";

// ============================================================================
// DRAWER COMPONENTS
// ============================================================================
// Base drawer with left/right anchor
export { AppDrawer } from "./Drawer";
// Left-side filter panel
export { FilterDrawer, FilterSection } from "./Drawer";
// Right-side detail/drilldown panel
export { DetailDrawer, DetailSection, DetailItem } from "./Drawer";
