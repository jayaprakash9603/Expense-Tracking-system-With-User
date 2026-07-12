import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesAction } from "@/redux/categories/categories.actions";
import { deduplicateCategories } from "../../utils/expenseCategoryUtils";

export function useExpenseCategories(friendId = "", autofetch = true) {
  const dispatch = useDispatch();
  const { list = [], loading = false, error = null } =
    useSelector((state) => state.categories || {});

  const fetchCategories = useCallback(() => {
    const params = friendId ? { targetId: friendId } : undefined;
    dispatch(fetchCategoriesAction(params));
  }, [dispatch, friendId]);

  useEffect(() => {
    if (autofetch) {
      fetchCategories();
    }
  }, [autofetch, fetchCategories]);

  const uniqueCategories = useMemo(
    () => deduplicateCategories(list),
    [list],
  );

  return {
    categories: list,
    uniqueCategories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

export default useExpenseCategories;
