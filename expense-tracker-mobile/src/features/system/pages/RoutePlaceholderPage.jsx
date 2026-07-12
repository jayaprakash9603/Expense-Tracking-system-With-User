import React from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { AppCard } from "@/shared/components/display/AppCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { getRouteByPath } from "@/app/routing/routeCatalog";

export function RoutePlaceholderPage({ title: overrideTitle, description: overrideDescription }) {
  const { t } = useLanguage();
  const location = useLocation();
  const route = getRouteByPath(location.pathname);
  const title = overrideTitle || (route ? t(route.titleKey) : location.pathname);
  const description = overrideDescription || t("system.comingSoon");

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[25rem]">
        <AppCard className="max-w-sm text-center">
          <AppCard.Content className="py-12 flex flex-col items-center gap-4">
            <AppIcon icon={Construction} color="primary" size="xl" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/60">{location.pathname}</p>
          </AppCard.Content>
        </AppCard>
      </div>
    </PageContainer>
  );
}

export default RoutePlaceholderPage;
