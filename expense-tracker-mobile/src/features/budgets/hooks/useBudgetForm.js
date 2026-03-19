import { useEntityForm } from "@/shared/patterns";
import { BUDGET_DEFAULTS } from "@/domain/budgets/budget.model";
import { validateBudget } from "@/domain/budgets/budget.validators";
import { fromApiResponse, toApiPayload } from "@/domain/budgets/budget.transformers";
import { createBudgetAction, updateBudgetAction, fetchBudgetByIdAction } from "@/redux/budgets/budgets.actions";

export function useBudgetForm({ mode = "create", entityId = null, onSuccess, onError } = {}) {
  return useEntityForm({
    mode,
    entityId,
    model: BUDGET_DEFAULTS,
    validator: validateBudget,
    transformer: { fromApi: fromApiResponse, toApi: toApiPayload },
    createAction: createBudgetAction,
    updateAction: updateBudgetAction,
    fetchAction: fetchBudgetByIdAction,
    onSuccess,
    onError,
  });
}

export default useBudgetForm;
