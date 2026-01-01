import { UPDATE_PROFILE_REQUEST } from "../Auth/auth.actionType";

import {
  CLEAR_ERROR,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  EDIT_EXPENSE_REQUEST,
  EDIT_EXPENSE_SUCCESS,
  EDIT_MUTLTIPLE_EXPENSE_REQUEST,
  EDIT_MUTLTIPLE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  FETCH_CASHFLOW_EXPENSES_FAILURE,
  FETCH_CASHFLOW_EXPENSES_REQUEST,
  FETCH_CASHFLOW_EXPENSES_SUCCESS,
  FETCH_EXPENSES_FAILURE,
  FETCH_EXPENSES_REQUEST,
  FETCH_EXPENSES_SUCCESS,
  FETCH_PREVIOUS_EXPENSES_FAILURE,
  FETCH_PREVIOUS_EXPENSES_REQUEST,
  FETCH_PREVIOUS_EXPENSES_SUCCESS,
  GET_ALL_EXPENSES_FAILURE,
  GET_ALL_EXPENSES_REQUEST,
  GET_ALL_EXPENSES_SUCCESS,
  GET_BUDGET_EXPENSES_FAILURE,
  GET_BUDGET_EXPENSES_REQUEST,
  GET_BUDGET_EXPENSES_SUCCESS,
  GET_BUDGET_FAILURE,
  GET_BUDGET_SUCCESS,
  GET_DATE_EXPENSES_FAILURE,
  GET_DATE_EXPENSES_REQUEST,
  GET_DATE_EXPENSES_SUCCESS,
  GET_EXPENSE_FAILURE,
  GET_EXPENSE_REQUEST,
  GET_EXPENSE_SUCCESS,
  GET_EXPENSE_SUMMARY_REQUEST,
  GET_EXPENSE_SUMMARY_SUCCESS,
  GET_EXPENSES_HISTORY_FAILURE,
  GET_EXPENSES_HISTORY_REQUEST,
  GET_EXPENSES_HISTORY_SUCCESS,
  GET_EXPENSES_SUGGESTIONS_FAILURE,
  GET_EXPENSES_SUGGESTIONS_REQUEST,
  GET_EXPENSES_SUGGESTIONS_SUCCESS,
  GET_SELECTED_EXPENSE_BUDGET_FAILURE,
  GET_SELECTED_EXPENSE_BUDGET_REQUEST,
  GET_SELECTED_EXPENSE_BUDGET_SUCCESS,
  RESET_UPLOAD_STATE,
  SAVE_EXPENSES_FAILURE,
  SAVE_EXPENSES_REQUEST,
  SAVE_EXPENSES_SUCCESS,
  UPLOAD_FILE_FAILURE,
  UPLOAD_FILE_REQUEST,
  UPLOAD_FILE_SUCCESS,
  GET_PARTICULAR_DATE_EXPENSES_FAILURE,
  GET_PARTICULAR_DATE_EXPENSES_REQUEST,
  GET_PARTICULAR_DATE_EXPENSES_SUCCESS,
  FETCH_CATEGORIES_WITH_EXPENSES_REQUEST,
  FETCH_CATEGORIES_WITH_EXPENSES_SUCCESS,
  FETCH_CATEGORIES_WITH_EXPENSES_FAILURE,
  COPY_EXPENSE_REQUEST,
  COPY_EXPENSE_SUCCESS,
  COPY_EXPENSE_FAILURE,
  UPLOAD_CATEGORIES_REQUEST,
  UPLOAD_CATEGORIES_SUCCESS,
  UPLOAD_CATEGORIES_FAILURE,
} from "./expense.actionType";

const initialState = {
  expenses: [],
  previousExpenses: [],
  expense: null, // For single expense
  loading: false,
  error: null,
  uploadSuccess: false,
  uploadError: null,
  summary: {},
  expensesBydate: [],
  topExpenses: [],
  history: [],
  budgetExpenses: [],
  cashflowExpenses: [],
  cashflowCache: {},
  cashflowLastFetchedSignature: null,
  cashflowOwnerId: null,
  particularDateExpenses: [],
  categoryExpenses: {},
  uploadCategoriesLoading: false,
  uploadCategoriesError: null,
  uploadedCategoriesPreview: [],
};

const clearCashflowCache = (state) => ({
  ...state,
  cashflowCache: {},
  cashflowLastFetchedSignature: null,
  cashflowOwnerId: null,
});

export const expenseReducer = (state = initialState, action) => {
  switch (action.type) {
    // Request actions
    case GET_ALL_EXPENSES_REQUEST:
    case CREATE_EXPENSE_REQUEST:
    case EDIT_EXPENSE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case GET_EXPENSE_REQUEST:
    case DELETE_EXPENSE_REQUEST:
    case EDIT_MUTLTIPLE_EXPENSE_REQUEST:
    case GET_DATE_EXPENSES_REQUEST:
    case GET_EXPENSE_SUMMARY_REQUEST:
    case GET_EXPENSES_SUGGESTIONS_REQUEST:
    case GET_EXPENSES_HISTORY_REQUEST:
    case FETCH_EXPENSES_REQUEST:
    case GET_BUDGET_EXPENSES_REQUEST:
    case GET_SELECTED_EXPENSE_BUDGET_REQUEST:
    case FETCH_CASHFLOW_EXPENSES_REQUEST:
    case GET_PARTICULAR_DATE_EXPENSES_REQUEST:
    case FETCH_CATEGORIES_WITH_EXPENSES_REQUEST:
    case COPY_EXPENSE_REQUEST:
      return { ...state, error: null, loading: true };
    case UPLOAD_CATEGORIES_REQUEST:
      return {
        ...state,
        uploadCategoriesLoading: true,
        uploadCategoriesError: null,
      };

    // Success actions

    case FETCH_CATEGORIES_WITH_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        categoryExpenses: action.payload,
      };
    case UPLOAD_CATEGORIES_SUCCESS:
      return {
        ...state,
        uploadCategoriesLoading: false,
        uploadedCategoriesPreview: action.payload,
      };

    case FETCH_CASHFLOW_EXPENSES_SUCCESS: {
      const signature = action.meta?.requestSignature ?? null;
      const payloadOwnerId = action.meta?.requestDescriptor?.ownerId ?? null;
      const nextCache =
        signature === null
          ? state.cashflowCache
          : { ...state.cashflowCache, [signature]: action.payload };
      return {
        ...state,
        loading: false,
        cashflowExpenses: action.payload,
        cashflowCache: nextCache,
        cashflowLastFetchedSignature: signature,
        cashflowOwnerId: payloadOwnerId,
        error: null,
      };
    }
    case GET_ALL_EXPENSES_SUCCESS:
    case GET_SELECTED_EXPENSE_BUDGET_SUCCESS:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };

    case GET_BUDGET_SUCCESS:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };

    case GET_BUDGET_EXPENSES_SUCCESS:
      return {
        ...state,
        budgetExpenses: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_EXPENSES_SUCCESS:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };
    case GET_EXPENSES_HISTORY_SUCCESS:
      return {
        ...state,
        history: action.payload,
        loading: false,
        error: null,
      };
    case GET_EXPENSES_SUGGESTIONS_SUCCESS:
      return {
        ...state,
        topExpenses: action.payload,
        loading: false,
        error: null,
      };
    case GET_DATE_EXPENSES_SUCCESS:
      return {
        ...state,
        expensesBydate: action.payload,
        loading: false,
        error: null,
      };
    case CREATE_EXPENSE_SUCCESS: {
      const nextState = {
        ...state,
        expenses: [...state.expenses, action.payload],
        loading: false,
        error: null,
      };
      return clearCashflowCache(nextState);
    }
    case EDIT_EXPENSE_SUCCESS:
    case EDIT_MUTLTIPLE_EXPENSE_SUCCESS:
      return clearCashflowCache({
        ...state,
        loading: false,
        error: null,
      });
    case GET_EXPENSE_SUMMARY_SUCCESS:
      return {
        ...state,
        summary: action.payload, // ✅ CORRECT
        loading: false,
        error: null,
      };
    case CLEAR_ERROR:
      return { ...state, error: null };
    case GET_EXPENSE_SUCCESS:
      return { ...state, expense: action.payload, loading: false, error: null };
    case DELETE_EXPENSE_SUCCESS: {
      const updatedExpenses = { ...state.expenses };

      // Loop through each date key and filter the deleted expense by id
      Object.keys(updatedExpenses).forEach((date) => {
        updatedExpenses[date] = updatedExpenses[date].filter(
          (expense) => expense.id !== action.payload
        );
      });
      return clearCashflowCache({
        ...state,
        expenses: updatedExpenses,
        loading: false,
      });
    }
    case GET_PARTICULAR_DATE_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        particularDateExpenses: action.payload,
      };
    case UPLOAD_FILE_SUCCESS:
    case SAVE_EXPENSES_SUCCESS:
      return clearCashflowCache(state);

    // Failure actions
    case GET_ALL_EXPENSES_FAILURE:
    case GET_EXPENSE_FAILURE:
    case DELETE_EXPENSE_FAILURE:
    case GET_DATE_EXPENSES_FAILURE:
    case GET_EXPENSES_SUGGESTIONS_FAILURE:
    case GET_EXPENSES_HISTORY_FAILURE:
    case FETCH_EXPENSES_FAILURE:
    case GET_BUDGET_EXPENSES_FAILURE:
    case GET_BUDGET_FAILURE:
    case GET_SELECTED_EXPENSE_BUDGET_FAILURE:
    case FETCH_CASHFLOW_EXPENSES_FAILURE:
    case GET_PARTICULAR_DATE_EXPENSES_FAILURE:
    case FETCH_CATEGORIES_WITH_EXPENSES_FAILURE:
    case COPY_EXPENSE_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPLOAD_CATEGORIES_FAILURE:
      return {
        ...state,
        uploadCategoriesLoading: false,
        uploadCategoriesError: action.payload,
      };
    case FETCH_PREVIOUS_EXPENSES_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_PREVIOUS_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        previousExpenses: action.payload,
      };
    case FETCH_PREVIOUS_EXPENSES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Default case
    default:
      return state;
  }
};

export const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_FILE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case UPLOAD_FILE_SUCCESS:
      return { ...state, loading: false, success: true, data: action.payload };
    case UPLOAD_FILE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case RESET_UPLOAD_STATE:
      return initialState;
    default:
      return state;
  }
};

export const saveExpensesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_EXPENSES_REQUEST:
      return { ...state, loading: true, error: null };
    case SAVE_EXPENSES_SUCCESS:
      return { ...state, loading: false, savedExpenses: action.payload };
    case SAVE_EXPENSES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
