// src/hooks/useExpenses.js

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExpensesAction } from "../../Redux/Expenses/expense.action";

const useExpenses = (jwt) => {
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  useEffect(() => {
    if (jwt) {
      dispatch(getExpensesAction(jwt));
    }
  }, [dispatch, jwt]);

  return { loading, error };
};

export default useExpenses;
