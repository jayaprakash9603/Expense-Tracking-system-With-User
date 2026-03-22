import { useMemo } from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { refineAreaChartModel, refinePieChartModel } from "@/features/expenses/utils/expenseReportViewFilters";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";
import { EMPTY_CARDS } from "@/features/expenses/components/reports/expenseReportContentConstants";

export function useExpenseReportChartModels({
  reportCards,
  dailySpending,
  category,
  payment,
  viewFilters = DEFAULT_EXPENSE_REPORT_VIEW_FILTERS,
  dailyFlowType,
}) {
  const { t } = useLanguage();
  const c = reportCards || EMPTY_CARDS;
  const areaKeys = dailySpending?.dataKeys?.length ? dailySpending.dataKeys : ["expense"];

  const displayCategory = useMemo(
    () =>
      refinePieChartModel(category, {
        topMode: viewFilters?.categoryTop ?? "all",
        groupBelowPercent: Number(viewFilters?.categoryGroupBelow) || 0,
        otherLabel: t("reports.otherSlice"),
      }),
    [category, viewFilters?.categoryTop, viewFilters?.categoryGroupBelow, t],
  );

  const displayPayment = useMemo(
    () =>
      refinePieChartModel(payment, {
        topMode: viewFilters?.paymentTop ?? "all",
        groupBelowPercent: Number(viewFilters?.paymentGroupBelow) || 0,
        otherLabel: t("reports.otherSlice"),
      }),
    [payment, viewFilters?.paymentTop, viewFilters?.paymentGroupBelow, t],
  );

  const displayDaily = useMemo(
    () =>
      refineAreaChartModel(dailySpending, {
        minDailyAmount: Number(viewFilters?.trendMinAmount) || 0,
      }),
    [dailySpending, viewFilters?.trendMinAmount],
  );

  const tooltipSelectedType = dailyFlowType === "inflow" ? "gain" : "loss";

  return {
    c,
    areaKeys,
    displayCategory,
    displayPayment,
    displayDaily,
    tooltipSelectedType,
  };
}
