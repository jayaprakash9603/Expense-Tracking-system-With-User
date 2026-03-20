import React from "react";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";

/**
 * Report-specific layout customization modal.
 */
export function ReportCustomizationModal(props) {
  return (
    <SectionCustomizationModal
      title="Customize Report Layout"
      subtitle="Choose report sections and reorder them for your workflow"
      {...props}
    />
  );
}

export default ReportCustomizationModal;
