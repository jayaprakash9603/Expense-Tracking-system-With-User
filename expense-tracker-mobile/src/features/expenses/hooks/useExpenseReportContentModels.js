import { useExpenseReportAccordionModels } from "@/features/expenses/hooks/useExpenseReportAccordionModels";
import { useExpenseReportChartModels } from "@/features/expenses/hooks/useExpenseReportChartModels";

export function useExpenseReportContentModels(props) {
  const charts = useExpenseReportChartModels(props);
  const accordion = useExpenseReportAccordionModels({
    groupedCashflowRaw: props.groupedCashflowRaw,
    categoryRaw: props.categoryRaw,
    paymentRaw: props.paymentRaw,
  });

  return { ...charts, ...accordion };
}
