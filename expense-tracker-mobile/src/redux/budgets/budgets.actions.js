import { budgetApi } from "@/infrastructure/api";
import {
  FETCH_BUDGETS_REQUEST,
  FETCH_BUDGETS_SUCCESS,
  FETCH_BUDGETS_FAILURE,
  FETCH_BUDGET_BY_ID_REQUEST,
  FETCH_BUDGET_BY_ID_SUCCESS,
  FETCH_BUDGET_BY_ID_FAILURE,
  CREATE_BUDGET_REQUEST,
  CREATE_BUDGET_SUCCESS,
  CREATE_BUDGET_FAILURE,
  UPDATE_BUDGET_REQUEST,
  UPDATE_BUDGET_SUCCESS,
  UPDATE_BUDGET_FAILURE,
  DELETE_BUDGET_REQUEST,
  DELETE_BUDGET_SUCCESS,
  DELETE_BUDGET_FAILURE,
  FETCH_BUDGET_OVERVIEW_REQUEST,
  FETCH_BUDGET_OVERVIEW_SUCCESS,
  FETCH_BUDGET_OVERVIEW_FAILURE,
  CLEAR_BUDGET_ERROR,
  RESET_BUDGET_STATE,
} from "./budgets.actionTypes";

export const fetchBudgetsAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_BUDGETS_REQUEST });
  const { data, error } = await budgetApi.getAll(params);
  if (error) {
    dispatch({ type: FETCH_BUDGETS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_BUDGETS_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchBudgetByIdAction = (id) => async (dispatch) => {
  dispatch({ type: FETCH_BUDGET_BY_ID_REQUEST });
  const { data, error } = await budgetApi.getById(id);
  if (error) {
    dispatch({ type: FETCH_BUDGET_BY_ID_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_BUDGET_BY_ID_SUCCESS, payload: data });
  return { success: true, data };
};

export const createBudgetAction = (budgetData) => async (dispatch) => {
  dispatch({ type: CREATE_BUDGET_REQUEST });
  const { data, error } = await budgetApi.create(budgetData);
  if (error) {
    dispatch({ type: CREATE_BUDGET_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: CREATE_BUDGET_SUCCESS, payload: data });
  return { success: true, data };
};

export const updateBudgetAction = (id, budgetData) => async (dispatch) => {
  dispatch({ type: UPDATE_BUDGET_REQUEST });
  const { data, error } = await budgetApi.update(id, budgetData);
  if (error) {
    dispatch({ type: UPDATE_BUDGET_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: UPDATE_BUDGET_SUCCESS, payload: data });
  return { success: true, data };
};

export const deleteBudgetAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_BUDGET_REQUEST });
  const { data, error } = await budgetApi.delete(id);
  if (error) {
    dispatch({ type: DELETE_BUDGET_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: DELETE_BUDGET_SUCCESS, payload: id });
  return { success: true, data };
};

export const fetchBudgetOverviewAction = () => async (dispatch) => {
  dispatch({ type: FETCH_BUDGET_OVERVIEW_REQUEST });
  const { data, error } = await budgetApi.getOverview();
  if (error) {
    dispatch({ type: FETCH_BUDGET_OVERVIEW_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_BUDGET_OVERVIEW_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearBudgetError = () => ({ type: CLEAR_BUDGET_ERROR });
export const resetBudgetState = () => ({ type: RESET_BUDGET_STATE });
