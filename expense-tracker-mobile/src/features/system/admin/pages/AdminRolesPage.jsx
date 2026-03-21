import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminRolesPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.roles.title")}
      description={t("admin.roles.description")}
    />
  );
}

export default AdminRolesPage;
