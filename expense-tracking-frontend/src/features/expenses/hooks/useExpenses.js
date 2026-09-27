import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { getExpensesAction, createExpenseAction } from "../../../Redux/Expenses/expense.action";

/**
 * React binding for expense use-cases (via Redux thunks that call repositories).
 */
export const useExpenses = () => {
  const dispatch = useDispatch();

  const fetchExpenses = useCallback(
    (sortOrder = "desc", targetId) =>
      dispatch(getExpensesAction(sortOrder, targetId)),
    [dispatch],
  );

  const addExpense = useCallback(
    (expenseData, targetId) =>
      dispatch(createExpenseAction(expenseData, targetId)),
    [dispatch],
  );

  return { fetchExpenses, addExpense };
};

export default useExpenses;
