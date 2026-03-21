import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminDashboardPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.dashboard.title")}
      description={t("admin.dashboard.description")}
    />
  );
}

export default AdminDashboardPage;
