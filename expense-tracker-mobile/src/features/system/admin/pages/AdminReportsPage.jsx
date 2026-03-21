import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminReportsPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.reports.title")}
      description={t("admin.reports.description")}
    />
  );
}

export default AdminReportsPage;
