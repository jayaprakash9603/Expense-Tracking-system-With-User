import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminUsersPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.users.title")}
      description={t("admin.users.description")}
    />
  );
}

export default AdminUsersPage;
