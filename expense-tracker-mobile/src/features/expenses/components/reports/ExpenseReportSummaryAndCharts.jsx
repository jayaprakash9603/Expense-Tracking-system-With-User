import React from "react";
import { ExpenseReportSummaryCards } from "./ExpenseReportSummaryCards";
import { ExpenseReportDailyTrendCard } from "../charts/ExpenseReportDailyTrendCard";
import { ExpenseReportCategoryPaymentCharts } from "../charts/ExpenseReportCategoryPaymentCharts";

export function ExpenseReportSummaryAndCharts({
  reportCards,
  displayDaily,
  displayCategory,
  displayPayment,
  areaKeys,
  tooltipSelectedType,
  tagline,
  dailyRefreshing,
  categoryRefreshing,
  paymentRefreshing,
  dailyFlowType,
  onDailyFlowTypeChange,
  dailyTimeframe,
  onDailyTimeframeChange,
  categoryFlowType,
  onCategoryFlowTypeChange,
  categoryTimeframe,
  onCategoryTimeframeChange,
  paymentFlowType,
  onPaymentFlowTypeChange,
  paymentTimeframe,
  onPaymentTimeframeChange,
}) {
  return (
    <>
      <ExpenseReportSummaryCards reportCards={reportCards} />
      <ExpenseReportDailyTrendCard
        displayDaily={displayDaily}
        areaKeys={areaKeys}
        tooltipSelectedType={tooltipSelectedType}
        tagline={tagline}
        dailyRefreshing={dailyRefreshing}
        dailyFlowType={dailyFlowType}
        onDailyFlowTypeChange={onDailyFlowTypeChange}
        dailyTimeframe={dailyTimeframe}
        onDailyTimeframeChange={onDailyTimeframeChange}
      />
      <ExpenseReportCategoryPaymentCharts
        displayCategory={displayCategory}
        displayPayment={displayPayment}
        tagline={tagline}
        categoryRefreshing={categoryRefreshing}
        paymentRefreshing={paymentRefreshing}
        categoryFlowType={categoryFlowType}
        onCategoryFlowTypeChange={onCategoryFlowTypeChange}
        categoryTimeframe={categoryTimeframe}
        onCategoryTimeframeChange={onCategoryTimeframeChange}
        paymentFlowType={paymentFlowType}
        onPaymentFlowTypeChange={onPaymentFlowTypeChange}
        paymentTimeframe={paymentTimeframe}
        onPaymentTimeframeChange={onPaymentTimeframeChange}
      />
    </>
  );
}
