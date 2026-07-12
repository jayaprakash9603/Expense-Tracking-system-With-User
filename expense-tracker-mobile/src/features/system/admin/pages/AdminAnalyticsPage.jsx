import React from "react";
import { RoutePlaceholderPage } from "@/features/system/pages/RoutePlaceholderPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AdminAnalyticsPage() {
  const { t } = useLanguage();
  return (
    <RoutePlaceholderPage
      title={t("admin.analytics.title")}
      description={t("admin.analytics.description")}
    />
  );
}

export default AdminAnalyticsPage;
