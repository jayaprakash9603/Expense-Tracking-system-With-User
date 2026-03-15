import * as actionTypes from "./sharedSelection.actionType";

export const setExpenseSelection = (selectedIds) => ({
  type: actionTypes.SET_EXPENSE_SELECTION,
  payload: selectedIds,
});

export const setCategorySelection = (selectedIds) => ({
  type: actionTypes.SET_CATEGORY_SELECTION,
  payload: selectedIds,
});

export const setPaymentMethodSelection = (selectedIds) => ({
  type: actionTypes.SET_PAYMENT_METHOD_SELECTION,
  payload: selectedIds,
});

export const setBillSelection = (selectedIds) => ({
  type: actionTypes.SET_BILL_SELECTION,
  payload: selectedIds,
});

export const setBudgetSelection = (selectedIds) => ({
  type: actionTypes.SET_BUDGET_SELECTION,
  payload: selectedIds,
});

export const clearAllSelections = () => ({
  type: actionTypes.CLEAR_ALL_SELECTIONS,
});
