import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlowPageLayout,
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
import { usePaymentMethodFlowData } from "@/features/payment-methods/hooks/usePaymentMethodFlowData";
import { useEntityFlowDrilldown } from "@/shared/hooks/flow/useEntityFlowDrilldown";
import { FLOW_PAGE_CHART_HEIGHT } from "@/config/chart/chartConfig";
import { ExpenseQuickActions } from "@/features/expenses/components";
import { MappedEntityIcon } from "@/shared/components/icons";

export function PaymentMethodFlowPage() {
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
  } = usePaymentMethodFlowData();

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
  const handleQuickAdd = useCallback(() => navigate("/payment-method/create"), [navigate]);
  const handleQuickUpload = useCallback(() => navigate("/upload/payments"), [navigate]);

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
        floatingActions={
          <ExpenseQuickActions
            floating
            onAdd={handleQuickAdd}
            onUpload={handleQuickUpload}
            addLabel={t("paymentMethods.addNew")}
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
                  {t("flows.paymentMethodFlow.paymentMethods")} (0)
                </>
              }
              message={t("common.noData")}
            />
          ) : showInlineDrilldown ? (
            <FlowEntityExpenseDrilldownContent
              entityName={selectedEntity.name}
              expenses={selectedExpenses}
              entityVariant="paymentMethod"
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
                  {t("flows.paymentMethodFlow.paymentMethods")} ({cardData.length})
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
                      variant="paymentMethod"
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
        entityVariant="paymentMethod"
        flowTab={flowTab}
        onExpenseNavigate={(id) => {
          clearDrilldown();
          navigate(`/expenses/${id}`);
        }}
      />
    </>
  );
}

export default PaymentMethodFlowPage;
