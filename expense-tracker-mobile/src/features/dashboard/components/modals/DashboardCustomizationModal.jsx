import React from "react";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function DashboardCustomizationModal(props) {
  const { t } = useLanguage();
  return (
    <SectionCustomizationModal
      {...props}
      title={props.title ?? t("customization.dashboardModal.title")}
      subtitle={props.subtitle ?? t("customization.dashboardModal.subtitle")}
    />
  );
}

export default DashboardCustomizationModal;
