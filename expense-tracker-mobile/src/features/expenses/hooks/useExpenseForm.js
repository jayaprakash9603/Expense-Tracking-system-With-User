import { useEntityForm } from "@/shared/patterns";
import { EXPENSE_DEFAULTS } from "@/domain/expenses/expense.model";
import { validateExpense } from "@/domain/expenses/expense.validators";
import { fromApiResponse, toApiPayload } from "@/domain/expenses/expense.transformers";
import { createExpenseAction, updateExpenseAction, fetchExpenseByIdAction } from "@/redux/expenses/expenses.actions";

export function useExpenseForm({ mode = "create", entityId = null, onSuccess, onError } = {}) {
  return useEntityForm({
    mode,
    entityId,
    model: EXPENSE_DEFAULTS,
    validator: validateExpense,
    transformer: { fromApi: fromApiResponse, toApi: toApiPayload },
    createAction: createExpenseAction,
    updateAction: updateExpenseAction,
    fetchAction: fetchExpenseByIdAction,
    onSuccess,
    onError,
  });
}

export default useExpenseForm;
