/**
 * Drawer Components
 *
 * Theme-aware drawer components for side panels.
 *
 * Components:
 * - AppDrawer: Base drawer with left/right anchor
 * - FilterDrawer: Left-side filter panel with apply/reset
 * - DetailDrawer: Right-side detail/drilldown panel
 *
 * Helper Components:
 * - FilterSection: Section organizer for FilterDrawer
 * - DetailSection: Section organizer for DetailDrawer
 * - DetailItem: Key-value display for DetailDrawer
 *
 * Usage:
 *   import { AppDrawer, FilterDrawer, DetailDrawer } from '../ui/Drawer';
 *   import { FilterSection, DetailSection, DetailItem } from '../ui/Drawer';
 *
 *   // Base drawer
 *   <AppDrawer
 *     open={isOpen}
 *     onClose={handleClose}
 *     anchor="right"
 *     title="Panel Title"
 *   >
 *     <Content />
 *   </AppDrawer>
 *
 *   // Filter drawer (left side)
 *   <FilterDrawer
 *     open={filterOpen}
 *     onClose={closeFilters}
 *     onApply={applyFilters}
 *     onReset={resetFilters}
 *     activeFilterCount={3}
 *   >
 *     <FilterSection label="Categories" first>
 *       <CheckboxList ... />
 *     </FilterSection>
 *     <FilterSection label="Date Range">
 *       <DatePicker ... />
 *     </FilterSection>
 *   </FilterDrawer>
 *
 *   // Detail drawer (right side)
 *   <DetailDrawer
 *     open={detailOpen}
 *     onClose={closeDetail}
 *     title="Transaction Details"
 *     subtitle="Jan 15, 2024"
 *     onCopy={handleCopy}
 *     onExport={handleExport}
 *   >
 *     <DetailSection title="Summary">
 *       <DetailItem label="Amount" value="$1,500.00" bold />
 *       <DetailItem label="Category" value="Shopping" />
 *     </DetailSection>
 *   </DetailDrawer>
 */

export { default as AppDrawer } from "./AppDrawer";
export { default as FilterDrawer, FilterSection } from "./FilterDrawer";
export {
  default as DetailDrawer,
  DetailSection,
  DetailItem,
} from "./DetailDrawer";
