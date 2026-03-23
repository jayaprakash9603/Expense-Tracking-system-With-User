import React, { useMemo } from "react";
import { useExpenseReportAccordionModels } from "@/features/expenses/hooks/reports/useExpenseReportAccordionModels";
import { useStandardExpenseColumns } from "@/features/expenses/hooks/list/useStandardExpenseColumns";
import {
  GroupedReportAccordion,
  GroupedReportAccordionViewToolbar,
} from "@/shared/components/report/grouped-report-accordion";
import { AllBudgetsReportCharts } from "@/features/reports/components/budget/AllBudgetsReportCharts";
import { aggregateDetailedBudgetByCategory, aggregateDetailedBudgetByPayment } from "@/features/reports/utils/budgetDetailAggregates";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function BudgetDetailReportBody({ rawData, categoryBreakdown, paymentBreakdown }) {
  const { t } = useLanguage();
  const columns = useStandardExpenseColumns();

  const categoryRaw = useMemo(
    () => aggregateDetailedBudgetByCategory(rawData || {}),
    [rawData],
  );
  const paymentRaw = useMemo(
    () => aggregateDetailedBudgetByPayment(rawData || {}),
    [rawData],
  );

  const {
    groupedReportViewMode,
    setGroupedReportViewMode,
    accordionGroups,
    accordionSectionTitleKey,
  } = useExpenseReportAccordionModels({
    groupedCashflowRaw: rawData,
    categoryRaw,
    paymentRaw,
  });

  const pieCategory = categoryBreakdown?.length
    ? categoryBreakdown.map((d) => ({
        ...d,
        value: d.amount ?? d.value ?? 0,
      }))
    : [{ name: "-", value: 0, amount: 0 }];
  const piePayment = paymentBreakdown?.length
    ? paymentBreakdown.map((d) => ({
        ...d,
        name: d.name ?? d.method ?? "-",
        value: d.amount ?? d.value ?? d.totalAmount ?? 0,
      }))
    : [{ name: "-", value: 0, amount: 0 }];

  return (
    <div className="space-y-8">
      <AllBudgetsReportCharts categoryBreakdown={pieCategory} paymentMethodBreakdown={piePayment} />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t(accordionSectionTitleKey)}</h3>
        <GroupedReportAccordionViewToolbar
          value={groupedReportViewMode}
          onValueChange={setGroupedReportViewMode}
        />
        <GroupedReportAccordion groups={accordionGroups} columns={columns} enableSelection={false} />
      </div>
    </div>
  );
}
