import { UPDATE_PROFILE_REQUEST } from "../Auth/auth.actionType";

import {
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  GET_ALL_EXPENSES_FAILURE,
  GET_ALL_EXPENSES_REQUEST,
  GET_ALL_EXPENSES_SUCCESS,
  GET_EXPENSE_FAILURE,
  GET_EXPENSE_REQUEST,
  GET_EXPENSE_SUCCESS,
} from "./expense.actionType";

const initialState = {
  expenses: [],
  expense: null, // For single expense
  loading: false,
  error: null,
};

export const expenseReducer = (state = initialState, action) => {
  switch (action.type) {
    // Request actions
    case GET_ALL_EXPENSES_REQUEST:
    case CREATE_EXPENSE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case GET_EXPENSE_REQUEST:
    case DELETE_EXPENSE_REQUEST:
      return { ...state, error: null, loading: true };

    // Success actions
    case GET_ALL_EXPENSES_SUCCESS:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };
    case CREATE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: [...state.expenses, action.payload], // Assuming payload contains the new expense
        loading: false,
        error: null,
      };
    case GET_EXPENSE_SUCCESS:
      return { ...state, expense: action.payload, loading: false, error: null };
    case DELETE_EXPENSE_SUCCESS:
      const updatedExpenses = { ...state.expenses };

      // Loop through each date key and filter the deleted expense by id
      Object.keys(updatedExpenses).forEach((date) => {
        updatedExpenses[date] = updatedExpenses[date].filter(
          (expense) => expense.id !== action.payload
        );
      });

      return {
        ...state,
        expenses: updatedExpenses,
        loading: false,
      };

    // Failure actions
    case GET_ALL_EXPENSES_FAILURE:
    case GET_EXPENSE_FAILURE:
    case DELETE_EXPENSE_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Default case
    default:
      return state;
  }
};
