import { useMemo, useState } from "react";
import {
  GROUPED_REPORT_VIEW_MODE,
  resolveGroupedReportGroups,
} from "@/shared/components/report/grouped-report-accordion";

export function useExpenseReportAccordionModels({
  groupedCashflowRaw,
  categoryRaw,
  paymentRaw,
}) {
  const [groupedReportViewMode, setGroupedReportViewMode] = useState(GROUPED_REPORT_VIEW_MODE.expenseName);
  const [selectedGlobalIds, setSelectedGlobalIds] = useState([]);

  const accordionGroups = useMemo(
    () =>
      resolveGroupedReportGroups(groupedReportViewMode, {
        groupedCashflowRaw,
        categoryRaw,
        paymentRaw,
      }),
    [groupedReportViewMode, groupedCashflowRaw, categoryRaw, paymentRaw],
  );

  const accordionSectionTitleKey = useMemo(() => {
    if (groupedReportViewMode === GROUPED_REPORT_VIEW_MODE.category) return "reports.categoryAmounts";
    if (groupedReportViewMode === GROUPED_REPORT_VIEW_MODE.paymentMethod) return "reports.paymentAmounts";
    return "reports.expenseAmounts";
  }, [groupedReportViewMode]);

  return {
    groupedReportViewMode,
    setGroupedReportViewMode,
    selectedGlobalIds,
    setSelectedGlobalIds,
    accordionGroups,
    accordionSectionTitleKey,
  };
}
