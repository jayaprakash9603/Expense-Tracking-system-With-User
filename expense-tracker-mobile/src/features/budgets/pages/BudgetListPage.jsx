import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FlowPageLayout, FlowExpenseCards } from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ExpenseQuickActions } from "@/shared/components/entity-form";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useBudgetList } from "../hooks/list/useBudgetList";
import { useBudgetsFlowData } from "../hooks/flow/useBudgetsFlowData";
import { useBudgetListViewMode } from "../hooks/list/useBudgetListViewMode";
import { BudgetViewModeToggle } from "../components/overview/BudgetViewModeToggle";
import { BudgetOverviewPage } from "../components/overview/BudgetOverviewPage";
import { BudgetOverviewStatCards } from "../components/overview/BudgetOverviewStatCards";
import { toBudgetCardModel } from "@/domain/budgets/budget.transformers";
import { FLOW_PAGE_CHART_HEIGHT } from "@/config/chart/chartConfig";

export function BudgetListPageView() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useBudgetListViewMode();
  const budgetList = useBudgetList({ transformItem: toBudgetCardModel });
  const flow = useBudgetsFlowData();
  const {
    activeRange,
    setActiveRange,
    rangeLabel,
    flowTab,
    setFlowTab,
    goNext,
    goPrev,
    resetOffset,
    rangeOptions,
    loading,
    chartData,
    cardData,
    chartConfig,
  } = flow;

  const barDataKeys = useMemo(() => {
    if (flowTab === "inflow") return ["income"];
    if (flowTab === "outflow") return ["expense"];
    return ["income", "expense"];
  }, [flowTab]);

  const viewModeToggle = useMemo(
    () => <BudgetViewModeToggle value={viewMode} onChange={setViewMode} />,
    [viewMode, setViewMode],
  );

  const handleAdd = useCallback(() => navigate("/budgets/add"), [navigate]);
  const handleUpload = useCallback(() => navigate("/upload/expenses"), [navigate]);
  const handleEdit = useCallback((id) => navigate(`/budgets/edit/${id}`), [navigate]);

  const overviewStats = useMemo(() => {
    const items = budgetList.items || [];
    let totalAllocated = 0;
    let totalSpent = 0;
    items.forEach((b) => {
      totalAllocated += Number(b.amount) || 0;
      totalSpent += Number(b.spent) || 0;
    });
    const totalRemaining = totalAllocated - totalSpent;
    const n = items.length;
    return {
      allCount: n,
      totalAllocated,
      totalSpent,
      totalRemaining,
      sparkCount: [Math.max(0, n - 1), n],
      sparkAllocated: [totalAllocated * 0.85, totalAllocated],
      sparkSpent: [totalSpent * 0.85, totalSpent],
      sparkRemaining: [totalRemaining * 1.05, totalRemaining],
    };
  }, [budgetList.items]);

  if (viewMode === "overview") {
    return (
      <BudgetOverviewPage
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeRange={activeRange}
        setActiveRange={setActiveRange}
        rangeLabel={rangeLabel}
        flowTab={flowTab}
        setFlowTab={setFlowTab}
        goNext={goNext}
        goPrev={goPrev}
        resetOffset={resetOffset}
        rangeOptions={rangeOptions}
        budgetList={budgetList}
        overviewStats={overviewStats}
        onAddBudget={handleAdd}
        onUploadBudget={handleUpload}
        onEditBudget={handleEdit}
        onAfterDelete={budgetList.refresh}
      />
    );
  }

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
      headerActions={viewModeToggle}
      floatingActions={
        <ExpenseQuickActions
          floating
          onAdd={handleAdd}
          onUpload={handleUpload}
          addLabel={t("budgets.addNew")}
          uploadLabel={t("navigation.upload")}
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
          onCardClick={(row) => navigate(`/expenses/edit/${row.id}`)}
        />
      }
    />
  );
}

export default BudgetListPageView;
