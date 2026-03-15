import * as actionTypes from "./sharedSelection.actionType";

const initialState = {
  selectedExpenses: [],
  selectedCategories: [],
  selectedPaymentMethods: [],
  selectedBills: [],
  selectedBudgets: [],
};

export const sharedSelectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_EXPENSE_SELECTION:
      return {
        ...state,
        selectedExpenses: action.payload,
      };
    case actionTypes.SET_CATEGORY_SELECTION:
      return {
        ...state,
        selectedCategories: action.payload,
      };
    case actionTypes.SET_PAYMENT_METHOD_SELECTION:
      return {
        ...state,
        selectedPaymentMethods: action.payload,
      };
    case actionTypes.SET_BILL_SELECTION:
      return {
        ...state,
        selectedBills: action.payload,
      };
    case actionTypes.SET_BUDGET_SELECTION:
      return {
        ...state,
        selectedBudgets: action.payload,
      };
    case actionTypes.CLEAR_ALL_SELECTIONS:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};
