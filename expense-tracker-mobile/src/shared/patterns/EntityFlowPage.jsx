import { cn } from "@/lib/utils";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function EntityFlowPage({
  title,
  stats = [],
  charts = [],
  listComponent,
  className,
}) {
  const { t } = useLanguage();
  return (
    <PageContainer className={cn("space-y-6", className)}>
      <h1 className="text-xl font-bold md:text-2xl">{title}</h1>

      {stats.length > 0 && (
        <ResponsiveGrid preset="stats">
          {stats.map((stat, i) => (
            <div key={i}>{stat}</div>
          ))}
        </ResponsiveGrid>
      )}

      {charts.length > 0 && (
        <ContentSection title={t("common.analytics")}>
          <ResponsiveGrid preset="cards">
            {charts.map((chart, i) => (
              <div key={i}>{chart}</div>
            ))}
          </ResponsiveGrid>
        </ContentSection>
      )}

      {listComponent && (
        <ContentSection title={t("common.recentActivity")}>
          {listComponent}
        </ContentSection>
      )}
    </PageContainer>
  );
}

export default EntityFlowPage;
