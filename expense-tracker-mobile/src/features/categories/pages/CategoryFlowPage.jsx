import React from "react";
import { useNavigate } from "react-router-dom";
import { FlowPageLayout, FlowEntityCard } from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useCategoryFlowData } from "@/features/categories/hooks/useCategoryFlowData";

export function CategoryFlowPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    activeRange, setActiveRange, rangeLabel, flowTab, setFlowTab,
    goNext, goPrev, resetOffset, rangeOptions, loading,
    chartData, cardData, totals, chartConfig, dataKeys,
  } = useCategoryFlowData();

  return (
    <FlowPageLayout
      title={t("navigation.categories")}
      activeRange={activeRange}
      setActiveRange={setActiveRange}
      rangeLabel={rangeLabel}
      flowTab={flowTab}
      setFlowTab={setFlowTab}
      onPrev={goPrev}
      onNext={goNext}
      onReset={resetOffset}
      rangeOptions={rangeOptions}
      loading={loading}
      totals={totals}
      chartSection={
        <ChartCard title={t("flows.categoryFlow.chartTitle")}>
          <AppBarChart
            data={chartData}
            config={chartConfig}
            dataKeys={dataKeys}
            xAxisKey="label"
            height={280}
            stacked
          />
        </ChartCard>
      }
      cardsSection={
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            {t("flows.categoryFlow.categories")} ({cardData.length})
          </h3>
          <div className="flex flex-col gap-2">
            {cardData.map((card) => (
              <FlowEntityCard
                key={card.id}
                name={card.name}
                amount={card.amount}
                count={card.count}
                color={card.color}
                onClick={() => navigate("/categories")}
              />
            ))}
            {cardData.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("common.noData")}
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}

export default CategoryFlowPage;
