import { useExpenseReportAccordionModels } from "./useExpenseReportAccordionModels";
import { useExpenseReportChartModels } from "./useExpenseReportChartModels";

export function useExpenseReportContentModels(props) {
  const charts = useExpenseReportChartModels(props);
  const accordion = useExpenseReportAccordionModels({
    groupedCashflowRaw: props.groupedCashflowRaw,
    categoryRaw: props.categoryRaw,
    paymentRaw: props.paymentRaw,
  });

  return { ...charts, ...accordion };
}
