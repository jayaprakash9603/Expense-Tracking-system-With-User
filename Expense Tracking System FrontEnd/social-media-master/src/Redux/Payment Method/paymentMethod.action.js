import { api } from "../../config/api";
import {
  CREATE_PAYMENT_METHOD_FAILURE,
  CREATE_PAYMENT_METHOD_REQUEST,
  CREATE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_FAILURE,
  DELETE_PAYMENT_METHOD_REQUEST,
  DELETE_PAYMENT_METHOD_SUCCESS,
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_FAILURE,
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_REQUEST,
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_SUCCESS,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_REQUEST,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_SUCCESS,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_FAILURE,
  UPDATE_PAYMENT_METHOD_REQUEST,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_FAILURE,
  GET_ALL_PAYMENT_METHOD_REQUEST,
  GET_ALL_PAYMENT_METHOD_SUCCESS,
  GET_ALL_PAYMENT_METHOD_FAILURE,
} from "./paymentMethod.actionType";

export const fetchPaymentMethodsWithExpenses =
  (rangeType, offset, flowType, friendId) => async (dispatch) => {
    dispatch({ type: FETCH_PAYMENT_METHODS_WITH_EXPENSES_REQUEST });
    try {
      const endpoint =
        friendId && friendId !== "undefined"
          ? `/api/expenses/all-by-payment-method/detailed/filtered/friend/${friendId}`
          : "/api/expenses/all-by-payment-method/detailed/filtered";

      const { data } = await api.get(endpoint, {
        params: { rangeType, offset, flowType },
      });

      dispatch({
        type: FETCH_PAYMENT_METHODS_WITH_EXPENSES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: FETCH_PAYMENT_METHODS_WITH_EXPENSES_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const deletePaymentMethod =
  (paymentMethodId, friendId) => async (dispatch) => {
    dispatch({ type: DELETE_PAYMENT_METHOD_REQUEST });
    try {
      const endpoint =
        friendId && friendId !== "undefined"
          ? `/api/payment-methods/${paymentMethodId}/friend/${friendId}`
          : `/api/payment-methods/${paymentMethodId}`;

      await api.delete(endpoint);

      dispatch({
        type: DELETE_PAYMENT_METHOD_SUCCESS,
        payload: paymentMethodId,
      });
    } catch (error) {
      dispatch({
        type: DELETE_PAYMENT_METHOD_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

export const createPaymentMethod =
  (paymentMethodData, friendId) => async (dispatch) => {
    dispatch({ type: CREATE_PAYMENT_METHOD_REQUEST });
    try {
      const endpoint =
        friendId && friendId !== "undefined"
          ? `/api/payment-methods/friend/${friendId}`
          : "/api/payment-methods";

      const { data } = await api.post(endpoint, paymentMethodData);

      dispatch({
        type: CREATE_PAYMENT_METHOD_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: CREATE_PAYMENT_METHOD_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

export const fetchPaymentMethodByTargetId =
  (paymentMethodId, targetId) => async (dispatch) => {
    dispatch({ type: FETCH_PAYMENT_METHOD_BY_TARGET_ID_REQUEST });

    try {
      const response = await api.get(
        `api/payment-methods/${paymentMethodId}?targetId=${targetId}`
      );

      console.log("Payment Method By Target ID Response:", response.data);
      dispatch({
        type: FETCH_PAYMENT_METHOD_BY_TARGET_ID_SUCCESS,
        payload: response.data,
      });

      // Return the response data so it can be used in the component
      return response.data;
    } catch (error) {
      console.error("Error in fetchPaymentMethodByTargetId:", error);
      dispatch({
        type: FETCH_PAYMENT_METHOD_BY_TARGET_ID_FAILURE,
        payload: error.response?.data?.message || error.message,
      });

      // Re-throw the error so it can be caught in the component
      throw error;
    }
  };

export const updatePaymentMethod =
  (id, paymentMethodData, friendId) => async (dispatch) => {
    dispatch({ type: UPDATE_PAYMENT_METHOD_REQUEST });
    try {
      const endpoint =
        friendId && friendId !== "undefined"
          ? `/api/payment-methods/friend/${friendId}`
          : "/api/payment-methods";

      const { data } = await api.put(`${endpoint}/${id}`, paymentMethodData);

      dispatch({
        type: UPDATE_PAYMENT_METHOD_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: UPDATE_PAYMENT_METHOD_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

export const fetchAllPaymentMethods = (targetId) => async (dispatch) => {
  dispatch({ type: GET_ALL_PAYMENT_METHOD_REQUEST });

  try {
    const response = await api.get(`api/payment-methods`);

    console.log("Payment Method By Target ID Response:", response.data);
    dispatch({
      type: GET_ALL_PAYMENT_METHOD_SUCCESS,
      payload: response.data,
    });

    // Return the response data so it can be used in the component
    return response.data;
  } catch (error) {
    console.error("Error in fetchPaymentMethodByTargetId:", error);
    dispatch({
      type: GET_ALL_PAYMENT_METHOD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });

    // Re-throw the error so it can be caught in the component
    throw error;
  }
};
