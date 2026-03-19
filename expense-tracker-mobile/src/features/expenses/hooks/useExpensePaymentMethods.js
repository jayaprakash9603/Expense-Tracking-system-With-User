import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentMethodsAction } from "@/redux/paymentMethods/paymentMethods.actions";
import { processPaymentMethods } from "../utils/expensePaymentMethodUtils";

export function useExpensePaymentMethods(
  friendId = "",
  transactionType = "loss",
  autofetch = true,
) {
  const dispatch = useDispatch();
  const { list = [], loading = false, error = null } =
    useSelector((state) => state.paymentMethods || {});

  const fetchPaymentMethods = useCallback(() => {
    dispatch(fetchPaymentMethodsAction(friendId));
  }, [dispatch, friendId]);

  useEffect(() => {
    if (autofetch) {
      fetchPaymentMethods();
    }
  }, [autofetch, fetchPaymentMethods]);

  const processedPaymentMethods = useMemo(
    () => processPaymentMethods(list, transactionType, true),
    [list, transactionType],
  );

  return {
    paymentMethods: list,
    processedPaymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
  };
}

export default useExpensePaymentMethods;
