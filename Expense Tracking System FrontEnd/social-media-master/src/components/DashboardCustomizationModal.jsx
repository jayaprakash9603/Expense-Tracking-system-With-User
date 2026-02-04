import React from "react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { SectionCustomizationModal } from "./common/SectionCustomization";

/**
 * DashboardCustomizationModal
 * Dashboard-specific wrapper around the generic SectionCustomizationModal.
 * Follows Open/Closed Principle: Extends base component without modification.
 */
export default function DashboardCustomizationModal({
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
      // Dashboard-specific customization
      title="Customize Dashboard"
      subtitle="Drag sections between columns • Reorder active sections"
      icon={DashboardIcon}
      typeLabels={{ full: "Full", half: "Half", bottom: "Bottom" }}
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
