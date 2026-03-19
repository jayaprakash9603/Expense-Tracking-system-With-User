import React from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { AppCard } from "@/shared/components/display/AppCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { getRouteByPath } from "@/app/routing/routeCatalog";

export function RoutePlaceholderPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const route = getRouteByPath(location.pathname);
  const title = route ? t(route.titleKey) : location.pathname;

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[400px]">
        <AppCard className="max-w-sm text-center">
          <AppCard.Content className="py-12 flex flex-col items-center gap-4">
            <AppIcon icon={Construction} color="primary" size="xl" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{t("system.comingSoon")}</p>
            <p className="text-xs text-muted-foreground/60">{location.pathname}</p>
          </AppCard.Content>
        </AppCard>
      </div>
    </PageContainer>
  );
}

export default RoutePlaceholderPage;
