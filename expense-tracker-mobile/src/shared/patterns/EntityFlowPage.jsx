import { cn } from "@/lib/utils";
import { PageContainer } from "@/shared/components/PageContainer";
import { ContentSection } from "@/shared/components/ContentSection";
import { ResponsiveGrid } from "@/shared/components/ResponsiveGrid";

export function EntityFlowPage({
  title,
  stats = [],
  charts = [],
  listComponent,
  className,
}) {
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
        <ContentSection title="Analytics">
          <ResponsiveGrid preset="cards">
            {charts.map((chart, i) => (
              <div key={i}>{chart}</div>
            ))}
          </ResponsiveGrid>
        </ContentSection>
      )}

      {listComponent && (
        <ContentSection title="Recent Activity">
          {listComponent}
        </ContentSection>
      )}
    </PageContainer>
  );
}

export default EntityFlowPage;
