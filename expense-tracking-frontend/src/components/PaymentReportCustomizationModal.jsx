import React from "react";
import { CreditCard as PaymentIcon } from "@mui/icons-material";
import { SectionCustomizationModal } from "./common/SectionCustomization";

/**
 * PaymentReportCustomizationModal
 * Payment Report-specific wrapper around the generic SectionCustomizationModal.
 * Follows Open/Closed Principle: Extends base component without modification.
 */
export default function PaymentReportCustomizationModal({
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
      // Payment Report-specific customization
      title="Customize Payment Report"
      subtitle="Drag sections between columns • Reorder active sections"
      icon={PaymentIcon}
      typeLabels={{ full: "Full", half: "Half" }}
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
