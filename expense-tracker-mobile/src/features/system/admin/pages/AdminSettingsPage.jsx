import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminSettingsPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.settings.title")}
      description={t("admin.settings.description")}
    />
  );
}

export default AdminSettingsPage;
