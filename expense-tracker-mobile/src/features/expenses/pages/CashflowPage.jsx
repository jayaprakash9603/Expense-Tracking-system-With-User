import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FlowPageLayout } from "@/shared/components/flow";
import { FlowEntityCard } from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useCashflowData } from "@/features/expenses/hooks/useCashflowData";

export function CashflowPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    activeRange, setActiveRange, rangeLabel, flowTab, setFlowTab,
    goNext, goPrev, resetOffset, rangeOptions, loading,
    chartData, cardData, totals, chartConfig,
  } = useCashflowData();

  const barDataKeys = useMemo(() => {
    if (flowTab === "inflow") return ["income"];
    if (flowTab === "outflow") return ["expense"];
    return ["income", "expense"];
  }, [flowTab]);

  return (
    <FlowPageLayout
      title={t("navigation.cashflow")}
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
        <ChartCard title={t("flows.cashflow.chartTitle")}>
          <AppBarChart
            data={chartData}
            config={chartConfig}
            dataKeys={barDataKeys}
            xAxisKey="label"
            height={280}
            stacked
          />
        </ChartCard>
      }
      cardsSection={
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            {t("flows.cashflow.transactions")} ({cardData.length})
          </h3>
          <div className="flex flex-col gap-2">
            {cardData.slice(0, 50).map((card) => (
              <FlowEntityCard
                key={card.id}
                name={card.name}
                amount={card.amount}
                count={null}
                color={card.type === "gain" ? "#10b981" : "#ef4444"}
                onClick={() => navigate(`/expenses/${card.id}`)}
              />
            ))}
            {cardData.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("expenses.noExpenses")}
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}

export default CashflowPage;
