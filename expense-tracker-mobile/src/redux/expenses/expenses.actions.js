import { expenseApi } from "@/infrastructure/api";
import {
  FETCH_EXPENSES_REQUEST,
  FETCH_EXPENSES_SUCCESS,
  FETCH_EXPENSES_FAILURE,
  FETCH_EXPENSE_BY_ID_REQUEST,
  FETCH_EXPENSE_BY_ID_SUCCESS,
  FETCH_EXPENSE_BY_ID_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  CREATE_EXPENSE_FAILURE,
  UPDATE_EXPENSE_REQUEST,
  UPDATE_EXPENSE_SUCCESS,
  UPDATE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  FETCH_DAILY_SPENDING_REQUEST,
  FETCH_DAILY_SPENDING_SUCCESS,
  FETCH_DAILY_SPENDING_FAILURE,
  FETCH_CASHFLOW_REQUEST,
  FETCH_CASHFLOW_SUCCESS,
  FETCH_CASHFLOW_FAILURE,
  FETCH_CATEGORY_DISTRIBUTION_REQUEST,
  FETCH_CATEGORY_DISTRIBUTION_SUCCESS,
  FETCH_CATEGORY_DISTRIBUTION_FAILURE,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_REQUEST,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_SUCCESS,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_FAILURE,
  CLEAR_EXPENSE_ERROR,
  RESET_EXPENSE_STATE,
} from "./expenses.actionTypes";

export const fetchExpensesAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_EXPENSES_REQUEST });
  const { data, error } = await expenseApi.getAll(params);
  if (error) {
    dispatch({ type: FETCH_EXPENSES_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_EXPENSES_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchExpensePaginatedAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_EXPENSES_REQUEST });
  const { data, error } = await expenseApi.getPaginated(params);
  if (error) {
    dispatch({ type: FETCH_EXPENSES_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_EXPENSES_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchExpenseByIdAction = (id, targetId = "") => async (dispatch) => {
  dispatch({ type: FETCH_EXPENSE_BY_ID_REQUEST });
  const { data, error } = await expenseApi.getById(id, targetId);
  if (error) {
    dispatch({ type: FETCH_EXPENSE_BY_ID_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_EXPENSE_BY_ID_SUCCESS, payload: data });
  return { success: true, data };
};

export const createExpenseAction = (expenseData) => async (dispatch) => {
  dispatch({ type: CREATE_EXPENSE_REQUEST });
  const { data, error } = await expenseApi.create(expenseData);
  if (error) {
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: data });
  return { success: true, data };
};

export const updateExpenseAction = (id, expenseData) => async (dispatch) => {
  dispatch({ type: UPDATE_EXPENSE_REQUEST });
  const { data, error } = await expenseApi.update(id, expenseData);
  if (error) {
    dispatch({ type: UPDATE_EXPENSE_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: UPDATE_EXPENSE_SUCCESS, payload: data });
  return { success: true, data };
};

export const deleteExpenseAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_EXPENSE_REQUEST });
  const { data, error } = await expenseApi.delete(id);
  if (error) {
    dispatch({ type: DELETE_EXPENSE_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: DELETE_EXPENSE_SUCCESS, payload: id });
  return { success: true, data };
};

export const fetchDailySpendingAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_DAILY_SPENDING_REQUEST });
  const { data, error } = await expenseApi.getDailySpending(params);
  if (error) {
    dispatch({ type: FETCH_DAILY_SPENDING_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_DAILY_SPENDING_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchCashflowAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_CASHFLOW_REQUEST });
  const { data, error } = await expenseApi.getDailySpending(params);
  if (error) {
    dispatch({ type: FETCH_CASHFLOW_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_CASHFLOW_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchCategoryDistributionAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORY_DISTRIBUTION_REQUEST });
  const { data, error } = await expenseApi.getCategoriesDetailed(params);
  if (error) {
    dispatch({ type: FETCH_CATEGORY_DISTRIBUTION_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_CATEGORY_DISTRIBUTION_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchPaymentMethodDistributionAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_PAYMENT_METHOD_DISTRIBUTION_REQUEST });
  const { data, error } = await expenseApi.getByPaymentMethod(params);
  if (error) {
    dispatch({ type: FETCH_PAYMENT_METHOD_DISTRIBUTION_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_PAYMENT_METHOD_DISTRIBUTION_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearExpenseError = () => ({ type: CLEAR_EXPENSE_ERROR });
export const resetExpenseState = () => ({ type: RESET_EXPENSE_STATE });
