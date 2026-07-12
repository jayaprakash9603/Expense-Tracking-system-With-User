import { CreditCard, LayoutGrid, ListTree } from "lucide-react";

export const GROUPED_REPORT_VIEW_MODE = {
  expenseName: "expenseName",
  category: "category",
  paymentMethod: "paymentMethod",
};

export function getGroupedReportViewOptions() {
  return [
    {
      value: GROUPED_REPORT_VIEW_MODE.expenseName,
      labelKey: "reports.groupedAccordion.viewByExpenseName",
      icon: ListTree,
    },
    {
      value: GROUPED_REPORT_VIEW_MODE.category,
      labelKey: "reports.groupedAccordion.viewByCategory",
      icon: LayoutGrid,
    },
    {
      value: GROUPED_REPORT_VIEW_MODE.paymentMethod,
      labelKey: "reports.groupedAccordion.viewByPaymentMethod",
      icon: CreditCard,
    },
  ];
}
