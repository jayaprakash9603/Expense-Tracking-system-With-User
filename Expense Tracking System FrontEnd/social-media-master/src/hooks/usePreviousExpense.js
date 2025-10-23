import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPreviousExpenses } from "../Redux/Expenses/expense.action";

/**
 * Custom hook to fetch and manage previous expense data
 *
 * @param {string} name - The expense/bill name
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} friendId - Optional friend ID for fetching friend's expenses
 * @param {number} minNameLength - Minimum name length to trigger fetch (default: 2)
 * @param {number} debounceDelay - Debounce delay in milliseconds (default: 500)
 *
 * @returns {Object} - { previousExpense, loadingPreviousExpense }
 *
 * @example
 * const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
 *   expenseData.expenseName,
 *   expenseData.date,
 *   friendId
 * );
 */
const usePreviousExpense = (
  name,
  date,
  friendId = "",
  minNameLength = 2,
  debounceDelay = 500
) => {
  const dispatch = useDispatch();
  const [previousExpense, setPreviousExpense] = useState(null);
  const [loadingPreviousExpense, setLoadingPreviousExpense] = useState(false);

  // Get previous expenses from Redux state
  const { previousExpenses: previousExpenseFromRedux } = useSelector(
    (state) => state.expenses || {}
  );

  // Fetch previous expense when name and date change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only fetch if we have both name and date
      if (!name?.trim() || name.trim().length < minNameLength) {
        setPreviousExpense(null);
        return;
      }

      if (!date) {
        setPreviousExpense(null);
        return;
      }

      setLoadingPreviousExpense(true);
      dispatch(
        fetchPreviousExpenses(name.trim(), date, friendId || "")
      ).finally(() => {
        setLoadingPreviousExpense(false);
      });
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [name, date, dispatch, friendId, minNameLength, debounceDelay]);

  // Update previous expense from Redux state
  useEffect(() => {
    if (previousExpenseFromRedux) {
      setPreviousExpense(previousExpenseFromRedux);
    } else {
      setPreviousExpense(null);
    }
  }, [previousExpenseFromRedux]);

  return {
    previousExpense,
    loadingPreviousExpense,
  };
};

export default usePreviousExpense;
