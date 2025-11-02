import {
  GET_BUDGET_FAILURE,
  GET_BUDGET_REQUEST,
  GET_BUDGET_SUCCESS,
} from "../Expenses/expense.actionType";
import {
  CREATE_BUDGET_FAILURE,
  CREATE_BUDGET_REQUEST,
  CREATE_BUDGET_SUCCESS,
  DELETE_BUDGET_FAILURE,
  DELETE_BUDGET_REQUEST,
  DELETE_BUDGET_SUCCESS,
  GET_ALL_BUDGET_DATA_FAILURE,
  GET_ALL_BUDGET_DATA_REQUEST,
  GET_ALL_BUDGET_DATA_SUCCESS,
  GET_BUDGET_DATA_FAILURE,
  GET_BUDGET_DATA_REQUEST,
  GET_BUDGET_DATA_SUCCESS,
  GET_DETAILED_BUDGET_REPORT_REQUEST,
  GET_DETAILED_BUDGET_REPORT_SUCCESS,
  GET_DETAILED_BUDGET_REPORT_FAILURE,
  GET_LIST_BUDGETS_FAILURE,
  GET_LIST_BUDGETS_REQUEST,
  GET_LIST_BUDGETS_SUCCESS,
  GET_SELECT_BUDGETS_FAILURE,
  GET_SELECT_BUDGETS_FAILURE_BY_EXPENSE_ID,
  GET_SELECT_BUDGETS_REQUEST,
  GET_SELECT_BUDGETS_REQUEST_BY_EXPENSE_ID,
  GET_SELECT_BUDGETS_SUCCESS,
  GET_SELECT_BUDGETS_SUCCESS_BY_EXPENSE_ID,
} from "./budget.actionType";

const initialState = {
  budgets: [],
  budget: {}, // For single budget
  detailedReport: null, // For detailed budget report
  loading: false,
  error: null,
  budgetExpenses: [],
};

export const budgetReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_BUDGET_REQUEST:
    case GET_ALL_BUDGET_DATA_REQUEST:
    case DELETE_BUDGET_REQUEST:
    case GET_BUDGET_DATA_REQUEST:
    case GET_BUDGET_REQUEST:
    case GET_LIST_BUDGETS_REQUEST:
    case GET_SELECT_BUDGETS_REQUEST:
    case GET_SELECT_BUDGETS_REQUEST_BY_EXPENSE_ID:
    case GET_DETAILED_BUDGET_REPORT_REQUEST:
      return { ...state, error: null, loading: true };
    case GET_ALL_BUDGET_DATA_SUCCESS:
    case GET_LIST_BUDGETS_SUCCESS:
    case GET_SELECT_BUDGETS_SUCCESS:
    case GET_SELECT_BUDGETS_SUCCESS_BY_EXPENSE_ID:
      return {
        ...state,
        budgets: action.payload,
        loading: false,
        error: null,
      };
    case GET_BUDGET_DATA_SUCCESS:
    case GET_BUDGET_SUCCESS:
      return {
        ...state,
        budget: action.payload,
        loading: false,
        error: null,
      };
    case GET_DETAILED_BUDGET_REPORT_SUCCESS:
      return {
        ...state,
        detailedReport: action.payload,
        loading: false,
        error: null,
      };
    case DELETE_BUDGET_SUCCESS:
      const updatedBudgets = { ...state.budgets };
      return {
        ...state,
        expenses: updatedBudgets,
        loading: false,
      };

    case CREATE_BUDGET_SUCCESS:
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
        loading: false,
        error: null,
      };
    case CREATE_BUDGET_FAILURE:
    case GET_ALL_BUDGET_DATA_FAILURE:
    case DELETE_BUDGET_FAILURE:
    case GET_BUDGET_DATA_FAILURE:
    case GET_BUDGET_FAILURE:
    case GET_LIST_BUDGETS_FAILURE:
    case GET_SELECT_BUDGETS_FAILURE:
    case GET_SELECT_BUDGETS_FAILURE_BY_EXPENSE_ID:
    case GET_DETAILED_BUDGET_REPORT_FAILURE:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};
