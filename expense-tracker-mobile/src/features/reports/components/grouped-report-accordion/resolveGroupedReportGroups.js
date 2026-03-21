import { mapRawDataToGroups } from "@/features/expenses/utils/expenseReportViewFilters";
import { GROUPED_REPORT_VIEW_MODE } from "./groupedReportAccordionViewModes";

export function resolveGroupedReportGroups(viewMode, { groupedCashflowRaw, categoryRaw, paymentRaw }) {
  if (viewMode === GROUPED_REPORT_VIEW_MODE.category) {
    return mapRawDataToGroups(categoryRaw);
  }
  if (viewMode === GROUPED_REPORT_VIEW_MODE.paymentMethod) {
    return mapRawDataToGroups(paymentRaw);
  }
  return mapRawDataToGroups(groupedCashflowRaw);
}
