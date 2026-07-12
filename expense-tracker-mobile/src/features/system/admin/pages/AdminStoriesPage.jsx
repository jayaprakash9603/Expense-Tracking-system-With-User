import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminStoriesPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.stories.title")}
      description={t("admin.stories.description")}
    />
  );
}

export default AdminStoriesPage;
