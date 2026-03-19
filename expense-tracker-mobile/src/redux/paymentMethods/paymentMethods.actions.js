import { paymentMethodApi } from "@/infrastructure/api";
import {
  FETCH_PAYMENT_METHODS_REQUEST,
  FETCH_PAYMENT_METHODS_SUCCESS,
  FETCH_PAYMENT_METHODS_FAILURE,
  CREATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_SUCCESS,
  CLEAR_PAYMENT_METHOD_ERROR,
  RESET_PAYMENT_METHOD_STATE,
} from "./paymentMethods.actionTypes";

export const fetchPaymentMethodsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_PAYMENT_METHODS_REQUEST });
  const { data, error } = await paymentMethodApi.getAll();
  if (error) {
    dispatch({ type: FETCH_PAYMENT_METHODS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_PAYMENT_METHODS_SUCCESS, payload: data });
  return { success: true, data };
};

export const createPaymentMethodAction = (data, friendId) => async (dispatch) => {
  const { data: result, error } = await paymentMethodApi.create(data, friendId);
  if (error) return { success: false, error };
  dispatch({ type: CREATE_PAYMENT_METHOD_SUCCESS, payload: result });
  return { success: true, data: result };
};

export const updatePaymentMethodAction = (data, friendId) => async (dispatch) => {
  const { data: result, error } = await paymentMethodApi.update(data, friendId);
  if (error) return { success: false, error };
  dispatch({ type: UPDATE_PAYMENT_METHOD_SUCCESS, payload: result });
  return { success: true, data: result };
};

export const deletePaymentMethodAction = (id) => async (dispatch) => {
  const { error } = await paymentMethodApi.delete(id);
  if (error) return { success: false, error };
  dispatch({ type: DELETE_PAYMENT_METHOD_SUCCESS, payload: id });
  return { success: true };
};

export const clearPaymentMethodError = () => ({ type: CLEAR_PAYMENT_METHOD_ERROR });
export const resetPaymentMethodState = () => ({ type: RESET_PAYMENT_METHOD_STATE });
