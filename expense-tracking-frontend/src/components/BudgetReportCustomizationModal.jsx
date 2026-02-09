import React from "react";
import SectionCustomizationModal from "./common/SectionCustomization/SectionCustomizationModal";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

/**
 * BudgetReportCustomizationModal - Modal for customizing budget report sections
 *
 * A wrapper around SectionCustomizationModal with budget report-specific styling.
 * Allows users to show/hide sections and reorder them via drag-and-drop.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Array} props.sections - Array of section objects with id, name, visible
 * @param {Function} props.onToggleSection - Callback to toggle section visibility
 * @param {Function} props.onReorderSections - Callback to reorder sections (startIndex, endIndex)
 * @param {Function} props.onResetLayout - Callback to reset layout to defaults
 * @param {Function} props.onSaveLayout - Callback to save current layout
 */
const BudgetReportCustomizationModal = ({
  open,
  onClose,
  sections,
  onToggleSection,
  onReorderSections,
  onResetLayout,
  onSaveLayout,
}) => {
  return (
    <SectionCustomizationModal
      open={open}
      onClose={onClose}
      title="Customize Budget Report"
      sections={sections}
      onToggleSection={onToggleSection}
      onReorderSections={onReorderSections}
      onResetLayout={onResetLayout}
      onSaveLayout={onSaveLayout}
      icon={AccountBalanceWalletIcon}
    />
  );
};

export default BudgetReportCustomizationModal;
