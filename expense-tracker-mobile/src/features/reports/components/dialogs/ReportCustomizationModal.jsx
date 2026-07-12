import React from "react";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ReportCustomizationModal(props) {
  const { t } = useLanguage();
  return (
    <SectionCustomizationModal
      {...props}
      title={props.title ?? t("customization.reportModal.title")}
      subtitle={props.subtitle ?? t("customization.reportModal.subtitle")}
    />
  );
}

export default ReportCustomizationModal;
