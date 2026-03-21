import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { FlowPageLayout, FlowExpenseCards } from "@/shared/components/flow";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ExpenseQuickActions } from "@/features/expenses/components";
import { useCashflowData } from "@/features/expenses/hooks/useCashflowData";
import { FLOW_PAGE_CHART_HEIGHT } from "@/config/chart/chartConfig";

export function CashflowPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    activeRange, setActiveRange, rangeLabel, flowTab, setFlowTab,
    goNext, goPrev, resetOffset, rangeOptions, loading,
    chartData, cardData, chartConfig,
  } = useCashflowData();

  const barDataKeys = useMemo(() => {
    if (flowTab === "inflow") return ["income"];
    if (flowTab === "outflow") return ["expense"];
    return ["income", "expense"];
  }, [flowTab]);

  const handleQuickAdd = useCallback(() => {
    navigate("/expenses/add");
  }, [navigate]);

  const handleQuickUpload = useCallback(() => {
    navigate("/upload/expenses");
  }, [navigate]);

  const headerActions = useMemo(
    () => (
      <AppButton
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 border-primary/40"
        aria-label={t("expenses.expenseReportsAria")}
        title={t("expenses.expenseReportsAria")}
        onClick={() => navigate("/expenses/reports")}
      >
        <AppIcon icon={BarChart3} color="primary" size="sm" />
      </AppButton>
    ),
    [navigate, t],
  );

  return (
    <FlowPageLayout
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
      headerActions={headerActions}
      floatingActions={
        <ExpenseQuickActions
          floating
          onAdd={handleQuickAdd}
          onUpload={handleQuickUpload}
        />
      }
      chartSection={
        <ChartCard contentClassName="px-1 sm:px-2 pb-2 pt-0">
          <AppBarChart
            data={chartData}
            config={chartConfig}
            dataKeys={barDataKeys}
            xAxisKey="label"
            height={FLOW_PAGE_CHART_HEIGHT}
            className="px-0 py-1"
            chartMargin={{ top: 8, right: 8, left: 0, bottom: 6 }}
            yAxisProps={{ width: 34, tickMargin: 2 }}
            stacked
            barRadius={flowTab === "all" ? 0 : 4}
          />
        </ChartCard>
      }
      cardsSection={
        <FlowExpenseCards
          data={cardData}
          loading={loading}
          flowTab={flowTab}
          onCardClick={(expense) => navigate(`/expenses/${expense.id}`)}
        />
      }
    />
  );
}

export default CashflowPage;
