import { useSelector } from "react-redux";
import { useEntityList } from "@/shared/patterns";
import { fetchBudgetsAction } from "@/redux/budgets/budgets.actions";
import { selectBudgetList, selectBudgetLoading } from "@/redux/selectors";
import { toListItem } from "@/domain/budgets/budget.transformers";
import { BUDGET_SEARCH_FIELDS, BUDGET_SORT_OPTIONS } from "../../config/budgetConfig";

export function useBudgetList(options = {}) {
  const { transformItem, ...rest } = options;
  const listLoading = useSelector(selectBudgetLoading);
  const entityList = useEntityList({
    fetchAction: fetchBudgetsAction,
    selector: selectBudgetList,
    searchFields: BUDGET_SEARCH_FIELDS,
    defaultSort: { field: "name", order: "asc" },
    transformItem: transformItem ?? toListItem,
    ...rest,
  });
  return {
    ...entityList,
    loading: listLoading,
  };
}

export { BUDGET_SORT_OPTIONS };
export default useBudgetList;
