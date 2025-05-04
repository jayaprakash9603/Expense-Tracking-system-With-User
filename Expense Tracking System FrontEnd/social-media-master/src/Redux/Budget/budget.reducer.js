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
} from "./budget.actionType";

const initialState = {
  budgets: [],

  budget: {}, // For single expense
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
      return { ...state, error: null, loading: true };
    case GET_ALL_BUDGET_DATA_SUCCESS:
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
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};
