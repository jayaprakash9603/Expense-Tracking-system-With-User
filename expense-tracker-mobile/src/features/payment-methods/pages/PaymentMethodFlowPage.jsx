import React from "react";
import { FlowPageLayout, FlowEntityCard } from "@/shared/components/flow";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { usePaymentMethodFlowData } from "@/features/payment-methods/hooks/usePaymentMethodFlowData";

export function PaymentMethodFlowPage() {
  const { t } = useLanguage();
  const {
    activeRange, setActiveRange, rangeLabel, flowTab, setFlowTab,
    goNext, goPrev, resetOffset, rangeOptions, loading,
    chartData, cardData, totals, chartConfig, dataKeys,
  } = usePaymentMethodFlowData();

  return (
    <FlowPageLayout
      title={t("navigation.payments")}
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
        <ChartCard title={t("flows.paymentMethodFlow.chartTitle")}>
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
            {t("flows.paymentMethodFlow.paymentMethods")} ({cardData.length})
          </h3>
          <div className="flex flex-col gap-2">
            {cardData.map((card) => (
              <FlowEntityCard
                key={card.id}
                name={card.name}
                amount={card.amount}
                count={card.count}
                color={card.color}
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

export default PaymentMethodFlowPage;
