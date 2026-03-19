import React from "react";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";

export function PaymentMethodSection() {
  const { t } = useLanguage();
  const { paymentMethodsTimeframe, setPaymentMethodsTimeframe, paymentMethodsFlowType, setPaymentMethodsFlowType } = useDashboardContext();
  const { paymentMethodBreakdown } = useDashboardCharts();

  return (
    <ChartCard
      title={t("dashboard.paymentMethods")}
      description={t("dashboard.expensesByPaymentMethod")}
      actions={
        <div className="flex items-center gap-2">
          <ChartTypeToggle
            options={SPENDING_FLOW_OPTIONS}
            value={paymentMethodsFlowType}
            onChange={setPaymentMethodsFlowType}
          />
          <TimeframeSelector
            value={paymentMethodsTimeframe}
            onChange={setPaymentMethodsTimeframe}
          />
        </div>
      }
    >
      <AppPieChart
        data={paymentMethodBreakdown.data}
        config={paymentMethodBreakdown.config}
        donut
        innerRadius={50}
        outerRadius={90}
        height={300}
      />
    </ChartCard>
  );
}

export default PaymentMethodSection;
