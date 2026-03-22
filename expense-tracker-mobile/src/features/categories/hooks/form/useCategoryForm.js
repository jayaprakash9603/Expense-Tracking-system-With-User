import { useEntityForm } from "@/shared/patterns";
import { CATEGORY_DEFAULTS } from "@/domain/categories/category.model";
import { validateCategory } from "@/domain/categories/category.validators";
import { fromApiResponse, toApiPayload } from "@/domain/categories/category.transformers";
import { createCategoryAction, updateCategoryAction } from "@/redux/categories/categories.actions";

export function useCategoryForm({ mode = "create", entityId = null, onSuccess, onError } = {}) {
  return useEntityForm({
    mode,
    entityId,
    model: CATEGORY_DEFAULTS,
    validator: validateCategory,
    transformer: { fromApi: fromApiResponse, toApi: toApiPayload },
    createAction: createCategoryAction,
    updateAction: updateCategoryAction,
    onSuccess,
    onError,
  });
}

export default useCategoryForm;
