import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlowPageLayout,
  FlowReportsToolbarButton,
  FlowEntityCard,
  FlowEntityCardsEmptyPanel,
  FlowEntityCardsGrid,
  FlowEntityCardsSkeleton,
  FlowEntityExpenseSheet,
  FlowEntityExpenseDrilldownContent,
} from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useIsMobile } from "@/shared/hooks/theme/useMediaQuery";
import { useCategoryFlowData } from "@/features/categories/hooks/flow/useCategoryFlowData";
import { useEntityFlowDrilldown } from "@/shared/hooks/flow/useEntityFlowDrilldown";
import { FLOW_PAGE_CHART_HEIGHT } from "@/config/chart/chartConfig";
import { ExpenseQuickActions } from "@/features/expenses/components";
import { MappedEntityIcon } from "@/shared/components/icons";

export function CategoryFlowPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    offset,
    chartData,
    cardData,
    chartConfig,
    dataKeys,
    expensesMap,
  } = useCategoryFlowData();

  const {
    sheetOpen,
    selectedEntity,
    selectedExpenses,
    handleCardClick,
    handleBarSeriesClick,
    clearDrilldown,
  } = useEntityFlowDrilldown({
    activeRange,
    offset,
    flowTab,
    chartData,
    chartConfig,
    cardData,
    expensesMap,
    openDrilldownInSheet: isMobile,
  });

  const showInlineDrilldown = Boolean(selectedEntity) && !isMobile;
  const handleQuickAdd = useCallback(() => navigate("/categories/add"), [navigate]);
  const handleQuickUpload = useCallback(() => navigate("/upload/categories"), [navigate]);

  const headerActions = useMemo(
    () => <FlowReportsToolbarButton to="/categories/reports" />,
    [],
  );

  return (
    <>
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
            addLabel={t("categories.addNew")}
          />
        }
        chartSection={
          <ChartCard contentClassName="px-1 sm:px-2 pb-2 pt-0">
            <AppBarChart
              data={chartData}
              config={chartConfig}
              dataKeys={dataKeys}
              xAxisKey="label"
              height={FLOW_PAGE_CHART_HEIGHT}
              className="px-0 py-1"
              chartMargin={{ top: 8, right: 8, left: 0, bottom: 6 }}
              yAxisProps={{ width: 34, tickMargin: 2 }}
              stacked
              barRadius={0}
              onBarSeriesClick={handleBarSeriesClick}
            />
          </ChartCard>
        }
        cardsSection={
          loading ? (
            <FlowEntityCardsSkeleton count={10} layout="grid" />
          ) : cardData.length === 0 ? (
            <FlowEntityCardsEmptyPanel
              title={
                <>
                  {t("flows.categoryFlow.categories")} (0)
                </>
              }
              message={t("common.noData")}
            />
          ) : showInlineDrilldown ? (
            <FlowEntityExpenseDrilldownContent
              entityName={selectedEntity.name}
              expenses={selectedExpenses}
              entityVariant="category"
              flowTab={flowTab}
              layout="inline"
              onCancel={clearDrilldown}
              onExpenseNavigate={(id) => {
                clearDrilldown();
                navigate(`/expenses/${id}`);
              }}
            />
          ) : (
            <FlowEntityCardsGrid
              title={
                <>
                  {t("flows.categoryFlow.categories")} ({cardData.length})
                </>
              }
            >
              {cardData.map((card) => (
                <FlowEntityCard
                  key={card.id}
                  variant="compact"
                  name={card.name}
                  amount={card.amount}
                  count={card.count}
                  color={card.color}
                  icon={
                    <MappedEntityIcon
                      variant="category"
                      value={card.icon || card.name}
                      renderMode="bare"
                      iconClassName="h-4 w-4"
                    />
                  }
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </FlowEntityCardsGrid>
          )
        }
      />
      <FlowEntityExpenseSheet
        open={sheetOpen && isMobile}
        onOpenChange={(open) => {
          if (!open) clearDrilldown();
        }}
        entityName={selectedEntity?.name}
        expenses={selectedExpenses}
        entityVariant="category"
        flowTab={flowTab}
        onExpenseNavigate={(id) => {
          clearDrilldown();
          navigate(`/expenses/${id}`);
        }}
      />
    </>
  );
}

export default CategoryFlowPage;
