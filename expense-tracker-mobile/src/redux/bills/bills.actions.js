import { billApi } from "@/infrastructure/api";
import {
  FETCH_BILLS_REQUEST,
  FETCH_BILLS_SUCCESS,
  FETCH_BILLS_FAILURE,
  CREATE_BILL_REQUEST,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAILURE,
  UPDATE_BILL_REQUEST,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAILURE,
  DELETE_BILL_REQUEST,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAILURE,
  MARK_BILL_PAID_REQUEST,
  MARK_BILL_PAID_SUCCESS,
  MARK_BILL_PAID_FAILURE,
  FETCH_UPCOMING_BILLS_REQUEST,
  FETCH_UPCOMING_BILLS_SUCCESS,
  FETCH_UPCOMING_BILLS_FAILURE,
  CLEAR_BILL_ERROR,
  RESET_BILL_STATE,
} from "./bills.actionTypes";

export const fetchBillByIdAction = (id) => async () => {
  const { data, error } = await billApi.getById(id);
  if (error) return { success: false, error };
  return { success: true, data };
};

export const fetchBillsAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_BILLS_REQUEST });
  const { data, error } = await billApi.getAll(params);
  if (error) {
    dispatch({ type: FETCH_BILLS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_BILLS_SUCCESS, payload: data });
  return { success: true, data };
};

export const createBillAction = (billData) => async (dispatch) => {
  dispatch({ type: CREATE_BILL_REQUEST });
  const { data, error } = await billApi.create(billData);
  if (error) {
    dispatch({ type: CREATE_BILL_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: CREATE_BILL_SUCCESS, payload: data });
  return { success: true, data };
};

export const updateBillAction = (id, billData) => async (dispatch) => {
  dispatch({ type: UPDATE_BILL_REQUEST });
  const { data, error } = await billApi.update(id, billData);
  if (error) {
    dispatch({ type: UPDATE_BILL_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: UPDATE_BILL_SUCCESS, payload: data });
  return { success: true, data };
};

export const deleteBillAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_BILL_REQUEST });
  const { data, error } = await billApi.delete(id);
  if (error) {
    dispatch({ type: DELETE_BILL_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: DELETE_BILL_SUCCESS, payload: id });
  return { success: true, data };
};

export const markBillPaidAction = (id) => async (dispatch) => {
  dispatch({ type: MARK_BILL_PAID_REQUEST });
  const { data, error } = await billApi.markPaid(id);
  if (error) {
    dispatch({ type: MARK_BILL_PAID_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: MARK_BILL_PAID_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchUpcomingBillsAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_UPCOMING_BILLS_REQUEST });
  const { data, error } = await billApi.getUpcoming(params);
  if (error) {
    dispatch({ type: FETCH_UPCOMING_BILLS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_UPCOMING_BILLS_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearBillError = () => ({ type: CLEAR_BILL_ERROR });
export const resetBillState = () => ({ type: RESET_BILL_STATE });
