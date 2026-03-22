import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FlowPageLayout, FlowExpenseCards } from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ExpenseQuickActions } from "@/shared/components/entity-form";
import { useBillsFlowData } from "@/features/bills/hooks/useBillsFlowData";
import { useBillListViewMode } from "@/features/bills/hooks/useBillListViewMode";
import { BillViewModeToggle } from "@/features/bills/components/overview/BillViewModeToggle";
import { BillOverviewPage } from "@/features/bills/components/overview/BillOverviewPage";
import { FLOW_PAGE_CHART_HEIGHT } from "@/config/chart/chartConfig";

export function BillListPageView() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useBillListViewMode();
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
    overviewStats,
    accordionRawBills,
    refresh,
  } = useBillsFlowData();

  const barDataKeys = useMemo(() => {
    if (flowTab === "inflow") return ["income"];
    if (flowTab === "outflow") return ["expense"];
    return ["income", "expense"];
  }, [flowTab]);

  const handleQuickAdd = useCallback(() => {
    navigate("/bills/add");
  }, [navigate]);

  const handleQuickUpload = useCallback(() => {
    navigate("/bill/upload");
  }, [navigate]);

  const handleEditBill = useCallback(
    (id) => {
      navigate(`/bills/edit/${id}`);
    },
    [navigate],
  );

  const viewModeToggle = useMemo(
    () => <BillViewModeToggle value={viewMode} onChange={setViewMode} />,
    [viewMode, setViewMode],
  );

  if (viewMode === "overview") {
    return (
      <BillOverviewPage
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
        loading={loading}
        overviewStats={overviewStats}
        accordionRawBills={accordionRawBills}
        onAddBill={handleQuickAdd}
        onUploadBill={handleQuickUpload}
        onEditBill={handleEditBill}
        onAfterDelete={refresh}
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
          onCardClick={(row) => navigate(`/bills/edit/${row.id}`)}
        />
      }
    />
  );
}

export default BillListPageView;
