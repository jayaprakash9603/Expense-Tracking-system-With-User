import { useEntityList } from "@/shared/patterns";
import { fetchBudgetsAction } from "@/redux/budgets/budgets.actions";
import { selectBudgetList } from "@/redux/selectors";
import { toListItem } from "@/domain/budgets/budget.transformers";
import { BUDGET_SEARCH_FIELDS, BUDGET_SORT_OPTIONS } from "../config/budgetConfig";

export function useBudgetList(options = {}) {
  return useEntityList({
    fetchAction: fetchBudgetsAction,
    selector: selectBudgetList,
    searchFields: BUDGET_SEARCH_FIELDS,
    defaultSort: { field: "name", order: "asc" },
    transformItem: toListItem,
    ...options,
  });
}

export { BUDGET_SORT_OPTIONS };
export default useBudgetList;
