import React from "react";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";

/**
 * Dashboard wrapper around section customization modal.
 */
export function DashboardCustomizationModal(props) {
  return (
    <SectionCustomizationModal
      title="Customize Dashboard"
      subtitle="Select, reorder, and organize dashboard sections"
      {...props}
    />
  );
}

export default DashboardCustomizationModal;
