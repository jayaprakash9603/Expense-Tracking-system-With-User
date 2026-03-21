import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminAuditPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.audit.title")}
      description={t("admin.audit.description")}
    />
  );
}

export default AdminAuditPage;
