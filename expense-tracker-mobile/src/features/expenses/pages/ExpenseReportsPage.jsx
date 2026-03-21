import React, { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ExpenseReportHeader } from "@/features/expenses/components/ExpenseReportHeader";
import { ExpenseReportContent } from "@/features/expenses/components/ExpenseReportContent";
import { useExpenseReportApiData } from "@/features/expenses/hooks/useExpenseReportApiData";
import { getTimeframeDateRange } from "@/shared/utils/chart/timeframeResolver";
import { expenseApi } from "@/infrastructure/api";
import { downloadBlobFile } from "@/shared/utils/file/downloadFile";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";

function toYmd(value) {
  return dayjs(value).format("YYYY-MM-DD");
}

export function ExpenseReportsPage() {
  const { t } = useLanguage();
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [fromDate, setFromDate] = useState(() => toYmd(getTimeframeDateRange("this_month").start));
  const [toDate, setToDate] = useState(() => toYmd(getTimeframeDateRange("this_month").end));

  const [dailyTimeframe, setDailyTimeframe] = useState("this_month");
  const [dailyFlowType, setDailyFlowType] = useState("all");
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("all");
  const [paymentTimeframe, setPaymentTimeframe] = useState("this_month");
  const [paymentFlowType, setPaymentFlowType] = useState("all");
  const [viewFilters, setViewFilters] = useState(() => ({ ...DEFAULT_EXPENSE_REPORT_VIEW_FILTERS }));

  const {
    initialLoading,
    dailyRefreshing,
    categoryRefreshing,
    paymentRefreshing,
    error,
    reportCards,
    dailySpending,
    category,
    payment,
    groupedCashflowRaw,
    categoryRaw,
    paymentRaw,
  } = useExpenseReportApiData({
    useCustomRange: isCustomRange,
    customFrom: fromDate,
    customTo: toDate,
    dailyTimeframe,
    dailyFlowType,
    categoryTimeframe,
    categoryFlowType,
    paymentTimeframe,
    paymentFlowType,
  });

  const handleDateApply = useCallback(({ fromDate: from, toDate: to }) => {
    setFromDate(from);
    setToDate(to);
    setIsCustomRange(true);
  }, []);

  const handleDateReset = useCallback(() => {
    setIsCustomRange(false);
    const { start, end } = getTimeframeDateRange("this_month");
    setFromDate(toYmd(start));
    setToDate(toYmd(end));
  }, []);

  const dateRangeProps = useMemo(
    () => ({
      fromDate,
      toDate,
      onApply: handleDateApply,
      onReset: handleDateReset,
    }),
    [fromDate, toDate, handleDateApply, handleDateReset],
  );

  const handleHeaderTimeframeChange = useCallback((value) => {
    setDailyTimeframe(value);
    setCategoryTimeframe(value);
    setPaymentTimeframe(value);
  }, []);

  const handleHeaderFlowChange = useCallback((value) => {
    setDailyFlowType(value);
    setCategoryFlowType(value);
    setPaymentFlowType(value);
  }, []);

  const handleExport = useCallback(async () => {
    let from = fromDate;
    let to = toDate;
    if (!isCustomRange) {
      const { start, end } = getTimeframeDateRange(dailyTimeframe);
      from = toYmd(start);
      to = toYmd(end);
    }
    const params = { fromDate: from, toDate: to };
    if (dailyFlowType === "outflow") {
      params.flowType = "outflow";
      params.type = "loss";
    } else if (dailyFlowType === "inflow") {
      params.flowType = "inflow";
      params.type = "gain";
    }
    const { data, error: exportErr } = await expenseApi.exportData(params);
    if (exportErr) {
      toast.error(exportErr.message || t("common.error"));
      return;
    }
    if (data) {
      downloadBlobFile(data, `expenses-${from}-${to}.csv`);
    }
  }, [fromDate, toDate, isCustomRange, dailyTimeframe, dailyFlowType, t]);

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <ExpenseReportHeader
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={isCustomRange}
        flowType={dailyFlowType}
        onFlowTypeChange={handleHeaderFlowChange}
        timeframe={dailyTimeframe}
        onTimeframeChange={handleHeaderTimeframeChange}
        onExport={handleExport}
        viewFilters={viewFilters}
        onViewFiltersChange={setViewFilters}
      />
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {typeof error === "object" && error?.message ? error.message : String(error)}
        </p>
      ) : null}
      <ExpenseReportContent
        initialLoading={initialLoading}
        dailyRefreshing={dailyRefreshing}
        categoryRefreshing={categoryRefreshing}
        paymentRefreshing={paymentRefreshing}
        reportCards={reportCards}
        dailySpending={dailySpending}
        category={category}
        payment={payment}
        groupedCashflowRaw={groupedCashflowRaw}
        categoryRaw={categoryRaw}
        paymentRaw={paymentRaw}
        viewFilters={viewFilters}
        dailyTimeframe={dailyTimeframe}
        onDailyTimeframeChange={setDailyTimeframe}
        dailyFlowType={dailyFlowType}
        onDailyFlowTypeChange={setDailyFlowType}
        categoryTimeframe={categoryTimeframe}
        onCategoryTimeframeChange={setCategoryTimeframe}
        categoryFlowType={categoryFlowType}
        onCategoryFlowTypeChange={setCategoryFlowType}
        paymentTimeframe={paymentTimeframe}
        onPaymentTimeframeChange={setPaymentTimeframe}
        paymentFlowType={paymentFlowType}
        onPaymentFlowTypeChange={setPaymentFlowType}
      />
    </PageContainer>
  );
}

export default ExpenseReportsPage;
