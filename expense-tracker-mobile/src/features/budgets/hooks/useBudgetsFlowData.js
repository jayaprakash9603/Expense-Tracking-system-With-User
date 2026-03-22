import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { fetchBudgetFlowExpensesAction } from "@/redux/budgets/budgets.actions";
import { selectBudgetFlowExpenses } from "@/redux/selectors";
import { fromApiResponse } from "@/domain/expenses/expense.transformers";
import { buildBillChartRows, getFlowRangeBounds } from "@/domain/bills/billsFlowChart";

function mapExpenseToFlowBillShape(raw) {
  const e = fromApiResponse(raw);
  const amt = Number(e.amount) || 0;
  return {
    date: e.date,
    amount: Math.abs(amt),
    flowType: amt >= 0 ? "loss" : "gain",
  };
}

function mapExpenseToFlowCard(raw) {
  const e = fromApiResponse(raw);
  const amt = Number(e.amount) || 0;
  return {
    id: e.id,
    name: e.name,
    amount: Math.abs(amt),
    date: e.date,
    type: amt >= 0 ? "loss" : "gain",
    categoryName: e.category,
    paymentMethod: e.paymentMethod,
    comments: e.comments,
    description: e.comments,
  };
}

export function useBudgetsFlowData() {
  const { t } = useLanguage();
  const paramsBuilder = useCallback(({ activeRange, offset }) => {
    const { rangeStart, rangeEnd } = getFlowRangeBounds(activeRange, offset);
    return { from: rangeStart, to: rangeEnd };
  }, []);

  const flow = useFlowData({
    storagePrefix: "budgetsFlow",
    fetchAction: fetchBudgetFlowExpensesAction,
    paramsBuilder,
    refetchOnFlowTabChange: false,
  });

  const rawList = useSelector(selectBudgetFlowExpenses) || [];
  const { rangeStart, rangeEnd } = useMemo(
    () => getFlowRangeBounds(flow.activeRange, flow.offset),
    [flow.activeRange, flow.offset],
  );

  const expensesInRange = useMemo(() => {
    if (!Array.isArray(rawList)) return [];
    return rawList.filter((raw) => {
      const e = fromApiResponse(raw);
      if (!e.budgetIds || e.budgetIds.length === 0) return false;
      const amt = Number(e.amount) || 0;
      if (flow.flowTab === "inflow") return amt < 0;
      if (flow.flowTab === "outflow") return amt > 0;
      return true;
    });
  }, [rawList, flow.flowTab]);

  const chartData = useMemo(() => {
    const mapped = expensesInRange.map(mapExpenseToFlowBillShape);
    const tab =
      flow.flowTab === "all"
        ? "all"
        : flow.flowTab === "inflow"
          ? "inflow"
          : "outflow";
    return buildBillChartRows(mapped, flow.activeRange, tab, rangeStart);
  }, [expensesInRange, flow.activeRange, flow.flowTab, rangeStart]);

  const cardData = useMemo(
    () =>
      expensesInRange
        .map((raw) => mapExpenseToFlowCard(raw))
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [expensesInRange],
  );

  const chartConfig = useMemo(
    () => ({
      income: { label: t("dashboard.gain"), color: "hsl(var(--chart-7))" },
      expense: { label: t("dashboard.loss"), color: "hsl(var(--chart-4))" },
    }),
    [t],
  );

  return {
    ...flow,
    chartData,
    cardData,
    chartConfig,
    rangeStart,
    rangeEnd,
  };
}
