import { useEntityList } from "@/shared/patterns";
import { fetchCategoriesAction } from "@/redux/categories/categories.actions";
import { selectCategoryList } from "@/redux/selectors";
import { toListItem } from "@/domain/categories/category.transformers";
import { CATEGORY_SEARCH_FIELDS, CATEGORY_SORT_OPTIONS } from "../../config/categoryConfig";

export function useCategoryList(options = {}) {
  return useEntityList({
    fetchAction: fetchCategoriesAction,
    selector: selectCategoryList,
    searchFields: CATEGORY_SEARCH_FIELDS,
    defaultSort: { field: "name", order: "asc" },
    transformItem: toListItem,
    ...options,
  });
}

export { CATEGORY_SORT_OPTIONS };
export default useCategoryList;
