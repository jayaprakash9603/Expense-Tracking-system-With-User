import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchExpensesAction, fetchDailySpendingAction, fetchCategoryDistributionAction, fetchPaymentMethodDistributionAction } from "@/redux/expenses/expenses.actions";
import { fetchBudgetsAction, fetchBudgetOverviewAction } from "@/redux/budgets/budgets.actions";
import { fetchBillsAction, fetchUpcomingBillsAction } from "@/redux/bills/bills.actions";
import { fetchFriendsAction } from "@/redux/friends/friends.actions";
import { fetchCategoriesAction } from "@/redux/categories/categories.actions";
import { resolveTimeframeParams, mapFlowType } from "@/shared/utils/chart/timeframeResolver";
import { buildDateRangeParams } from "@/shared/utils/chart/dataTransformers";

export function useDashboardFetch(refreshKey = 0, {
  spendingTimeframe = "this_month",
  spendingType = "loss",
  categoryTimeframe = "this_month",
  categoryFlowType = "loss",
  paymentMethodsTimeframe = "this_month",
  paymentMethodsFlowType = "loss",
} = {}) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExpensesAction());
    dispatch(fetchBudgetsAction());
    dispatch(fetchBudgetOverviewAction());
    dispatch(fetchBillsAction());
    dispatch(fetchUpcomingBillsAction());
    dispatch(fetchFriendsAction());
    dispatch(fetchCategoriesAction());
  }, [dispatch, refreshKey]);

  useEffect(() => {
    const timeframeParams = resolveTimeframeParams(spendingTimeframe);
    const flowType = mapFlowType(spendingType);
    const params = {
      ...timeframeParams,
      type: spendingType,
      ...(flowType && { flowType }),
    };
    dispatch(fetchDailySpendingAction(params));
  }, [dispatch, refreshKey, spendingTimeframe, spendingType]);

  useEffect(() => {
    const params = buildDateRangeParams(categoryTimeframe, categoryFlowType);
    dispatch(fetchCategoryDistributionAction(params));
  }, [dispatch, refreshKey, categoryTimeframe, categoryFlowType]);

  useEffect(() => {
    const params = buildDateRangeParams(paymentMethodsTimeframe, paymentMethodsFlowType);
    dispatch(fetchPaymentMethodDistributionAction(params));
  }, [dispatch, refreshKey, paymentMethodsTimeframe, paymentMethodsFlowType]);
}

export default useDashboardFetch;
