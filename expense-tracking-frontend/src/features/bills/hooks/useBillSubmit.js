import { useCallback } from "react";
import { createBill, updateBill } from "../../../Redux/Bill/bill.action";
import {
  validateBillFields,
  filterValidExpenses,
  filterInvalidExpenses,
  computeTotalAmount,
  buildCreatePayload,
  buildUpdatePayload,
} from "../utils/billFormUtils";

export default function useBillSubmit({
  isCreateMode,
  isEditMode,
  billData,
  expenses,
  selectedBudgets,
  currentBillId,
  dispatch,
  friendId,
  t,
  setErrors,
  navigate,
  navigateWithState,
  onClose,
  onSuccess,
  resetFormData,
  resetExpenseState,
  dateFromQuery,
  today,
}) {
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const fieldErrors = validateBillFields(billData);
      const validExpenses = filterValidExpenses(expenses);

      if (validExpenses.length === 0) {
        fieldErrors.expenses = true;
        alert(
          t(
            isCreateMode
              ? "billCommon.messages.expensesRequiredCreate"
              : "billCommon.messages.expensesRequiredUpdate",
          ),
        );
      }

      if (isEditMode) {
        const invalid = filterInvalidExpenses(expenses);
        if (invalid.length > 0) {
          fieldErrors.expenses = true;
          alert(t("billCommon.messages.invalidQuantityOrPrice"));
        }
      }

      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length > 0) return;

      const totalAmount = computeTotalAmount(validExpenses);
      if (totalAmount <= 0) {
        alert(t("billCommon.messages.totalAmountInvalid"));
        return;
      }

      try {
        if (isCreateMode) {
          const payload = buildCreatePayload(billData, validExpenses, selectedBudgets);
          const resultAction = await dispatch(createBill(payload, friendId || ""));

          if (resultAction && !resultAction.error) {
            alert(t("createBill.messages.success"));
            resetFormData({ date: dateFromQuery || today });
            resetExpenseState();
            if (onSuccess) onSuccess(resultAction.payload || resultAction);
            if (onClose) {
              onClose();
            } else {
              navigate(-1);
              navigateWithState(-1, { preserve: false });
              navigateWithState(-1, { preserve: false });
            }
          } else {
            const msg =
              resultAction?.error?.message ||
              resultAction?.payload?.message ||
              resultAction?.message ||
              "Failed to create bill. Please try again.";
            alert(t("createBill.messages.errorWithReason", { message: msg }));
          }
        } else {
          const updatedPayload = buildUpdatePayload(
            currentBillId,
            billData,
            expenses,
            selectedBudgets,
          );
          const result = await dispatch(
            updateBill(currentBillId, updatedPayload, friendId || ""),
          );
          if (result) {
            alert(t("editBill.messages.success"));
            if (onSuccess) onSuccess(result);
            if (onClose) {
              onClose();
            } else {
              navigateWithState(-1, { preserve: false });
            }
          }
        }
      } catch (error) {
        const key = isCreateMode
          ? "createBill.messages.errorWithReason"
          : "editBill.messages.errorWithReason";
        alert(
          t(key, {
            message:
              error.message ||
              t(
                isCreateMode
                  ? "createBill.messages.failure"
                  : "editBill.messages.failure",
              ),
          }),
        );
      }
    },
    [
      billData,
      expenses,
      selectedBudgets,
      currentBillId,
      isCreateMode,
      isEditMode,
      dispatch,
      friendId,
      t,
      setErrors,
      navigate,
      navigateWithState,
      onClose,
      onSuccess,
      resetFormData,
      resetExpenseState,
      dateFromQuery,
      today,
    ],
  );

  return { handleSubmit };
}
