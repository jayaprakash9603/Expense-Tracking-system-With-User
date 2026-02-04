import React from "react";
import { Assessment as ReportIcon } from "@mui/icons-material";
import { SectionCustomizationModal } from "./common/SectionCustomization";

/**
 * ExpenseReportCustomizationModal
 * Expense Report-specific wrapper around the generic SectionCustomizationModal.
 * Follows Open/Closed Principle: Extends base component without modification.
 */
export default function ExpenseReportCustomizationModal({
  open,
  onClose,
  sections,
  onToggleSection,
  onReorderSections,
  onResetLayout,
  onSaveLayout,
}) {
  return (
    <SectionCustomizationModal
      open={open}
      onClose={onClose}
      sections={sections}
      onSaveLayout={onSaveLayout}
      onResetLayout={onResetLayout}
      // Expense Report-specific customization
      title="Customize Expense Report"
      subtitle="Drag sections between columns • Reorder active sections"
      icon={ReportIcon}
      typeLabels={{ full: "Full Width", half: "Half Width" }}
      availableTitle="📦 Available Sections"
      availableSubtitle="Drag sections to the right to activate"
      activeTitle="✓ Active Sections"
      activeSubtitle="Reorder by dragging • Remove by dragging left"
      availableEmptyMessage="All sections are active!"
      activeEmptyMessage="Drag sections here to activate"
      showReset={true}
      labels={{
        save: "Save Layout",
        reset: "Reset to Default",
        cancel: "Cancel",
        active: "Active",
        available: "Available",
      }}
    />
  );
}
