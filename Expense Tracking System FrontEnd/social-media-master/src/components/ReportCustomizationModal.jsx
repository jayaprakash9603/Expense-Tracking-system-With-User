import React from "react";
import { Assessment as ReportIcon } from "@mui/icons-material";
import { SectionCustomizationModal } from "./common/SectionCustomization";

/**
 * ReportCustomizationModal
 * Report-specific wrapper around the generic SectionCustomizationModal.
 * Example of extending the reusable component for different contexts.
 *
 * Usage:
 * <ReportCustomizationModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   sections={reportSections}
 *   onSaveLayout={handleSave}
 *   onResetLayout={handleReset}
 *   reportType="expenses" // or "payment", "category", "budget"
 * />
 */
const ReportCustomizationModal = ({
  open,
  onClose,
  sections,
  onSaveLayout,
  onResetLayout,
  reportType = "expenses",
  // Allow overriding defaults
  title,
  subtitle,
  icon,
  typeLabels,
  labels,
  showReset = true,
}) => {
  // Report-specific defaults based on reportType
  const reportConfig = {
    expenses: {
      title: "Customize Expenses Report",
      subtitle: "Configure which sections appear in your expenses report",
      typeLabels: { chart: "Chart", table: "Table", summary: "Summary" },
    },
    payment: {
      title: "Customize Payment Report",
      subtitle: "Configure payment method report sections",
      typeLabels: { breakdown: "Breakdown", trend: "Trend", list: "List" },
    },
    category: {
      title: "Customize Category Report",
      subtitle: "Configure category distribution report sections",
      typeLabels: { pie: "Pie", bar: "Bar", details: "Details" },
    },
    budget: {
      title: "Customize Budget Report",
      subtitle: "Configure budget overview report sections",
      typeLabels: {
        progress: "Progress",
        forecast: "Forecast",
        history: "History",
      },
    },
  };

  const config = reportConfig[reportType] || reportConfig.expenses;

  return (
    <SectionCustomizationModal
      open={open}
      onClose={onClose}
      sections={sections}
      onSaveLayout={onSaveLayout}
      onResetLayout={onResetLayout}
      // Use provided values or fall back to report-specific defaults
      title={title || config.title}
      subtitle={subtitle || config.subtitle}
      icon={icon || ReportIcon}
      typeLabels={typeLabels || config.typeLabels}
      availableTitle="📦 Available Sections"
      availableSubtitle="Select sections to include in report"
      activeTitle="✓ Visible Sections"
      activeSubtitle="Drag to reorder • These appear in your report"
      availableEmptyMessage="All sections are visible!"
      activeEmptyMessage="Add sections to your report"
      showReset={showReset}
      labels={{
        save: "Save Configuration",
        reset: "Reset to Default",
        cancel: "Cancel",
        active: "Visible",
        available: "Hidden",
        ...labels,
      }}
    />
  );
};

export default ReportCustomizationModal;
