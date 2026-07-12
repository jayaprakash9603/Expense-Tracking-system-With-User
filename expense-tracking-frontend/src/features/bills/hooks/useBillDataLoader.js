import { useState, useEffect, useCallback } from "react";
import {
  getBillById,
  getBillByExpenseId,
} from "../../../Redux/Bill/bill.action";
import {
  mapBillResponseToFormData,
  mapBillResponseToExpenses,
} from "../utils/billFormUtils";

export default function useBillDataLoader({
  isEditMode,
  currentBillId,
  expenseId,
  dispatch,
  friendId,
  t,
  onDataLoaded,
}) {
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState(null);

  const loadBillData = useCallback(async () => {
    if (!currentBillId && !expenseId) {
      setLoadError(t("editBill.messages.noBillId"));
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setLoadError(null);

      let billResponse;
      if (expenseId && !currentBillId) {
        billResponse = await dispatch(getBillByExpenseId(expenseId, friendId || ""));
      } else {
        billResponse = await dispatch(getBillById(currentBillId, friendId || ""));
      }

      const bill = billResponse?.payload || billResponse?.data || billResponse;
      if (!bill || !bill.id) {
        throw new Error(t("editBill.messages.invalidData"));
      }

      const formData = mapBillResponseToFormData(bill);
      const expenses = mapBillResponseToExpenses(bill);
      const budgetIds =
        bill.budgetIds && Array.isArray(bill.budgetIds) ? bill.budgetIds : [];

      onDataLoaded({ formData, expenses, budgetIds });
    } catch (error) {
      setLoadError(error.message || t("editBill.messages.invalidData"));
    } finally {
      setIsLoading(false);
    }
  }, [currentBillId, expenseId, dispatch, friendId, t, onDataLoaded]);

  useEffect(() => {
    if (isEditMode) {
      loadBillData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, currentBillId, dispatch, friendId, expenseId]);

  return { isLoading, loadError };
}
