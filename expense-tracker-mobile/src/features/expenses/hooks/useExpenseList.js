import { useEntityList } from "@/shared/patterns";
import { fetchExpensesAction } from "@/redux/expenses/expenses.actions";
import { selectExpenseList } from "@/redux/selectors";
import { toListItem } from "@/domain/expenses/expense.transformers";
import { EXPENSE_SEARCH_FIELDS, EXPENSE_SORT_OPTIONS } from "../config/expenseConfig";

export function useExpenseList(options = {}) {
  return useEntityList({
    fetchAction: fetchExpensesAction,
    selector: selectExpenseList,
    searchFields: EXPENSE_SEARCH_FIELDS,
    defaultSort: { field: "date", order: "desc" },
    transformItem: toListItem,
    ...options,
  });
}

export { EXPENSE_SORT_OPTIONS };
export default useExpenseList;
