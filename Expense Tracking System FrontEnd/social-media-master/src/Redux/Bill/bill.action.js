import axios from "axios";
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
  GET_BILL_BY_ID_REQUEST,
  GET_BILL_BY_ID_SUCCESS,
  GET_BILL_BY_ID_FAILURE,
  FILTER_BILLS_BY_TYPE,
  SET_BILLS_PAGINATION,
  CLEAR_BILLS_ERROR,
  RESET_BILLS_STATE,
} from "./bill.actionType";
import { api } from "../../config/api";

// Fetch all bills
export const fetchBills =
  (month, year, targetId = null) =>
  async (dispatch) => {
    dispatch({ type: FETCH_BILLS_REQUEST });
    try {
      const config = {
        params: targetId ? { targetId, month, year } : { month, year },
      };

      const response = await api.get(`api/bills`, config);
      console.log("Fetched Bills:", response.data); // Debugging log
      dispatch({
        type: FETCH_BILLS_SUCCESS,
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: FETCH_BILLS_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// Create a new bill
export const createBill = (billData, friendId) => async (dispatch) => {
  dispatch({ type: CREATE_BILL_REQUEST });
  try {
    const config = {};

    const response = await api.post(`api/bills`, billData, config);
    dispatch({
      type: CREATE_BILL_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: CREATE_BILL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update an existing bill
export const updateBill = (jwt, billId, billData) => async (dispatch) => {
  dispatch({ type: UPDATE_BILL_REQUEST });
  try {
    const config = {};

    const response = await api.put(`api/bills/${billId}`, billData, config);
    dispatch({
      type: UPDATE_BILL_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_BILL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete a bill
export const deleteBill = (jwt, billId) => async (dispatch) => {
  dispatch({ type: DELETE_BILL_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    await api.delete(`api/bills/${billId}`, config);
    dispatch({
      type: DELETE_BILL_SUCCESS,
      payload: billId,
    });
  } catch (error) {
    dispatch({
      type: DELETE_BILL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get bill by ID
export const getBillById = (jwt, billId) => async (dispatch) => {
  dispatch({ type: GET_BILL_BY_ID_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await api.get(`api/bills/${billId}`, config);
    dispatch({
      type: GET_BILL_BY_ID_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_BILL_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Filter bills by type (gain/loss/all)
export const filterBillsByType = (filterType) => ({
  type: FILTER_BILLS_BY_TYPE,
  payload: filterType,
});

// Set pagination
export const setBillsPagination = (currentPage, itemsPerPage) => ({
  type: SET_BILLS_PAGINATION,
  payload: { currentPage, itemsPerPage },
});

// Clear error
export const clearBillsError = () => ({
  type: CLEAR_BILLS_ERROR,
});

// Reset bills state
export const resetBillsState = () => ({
  type: RESET_BILLS_STATE,
});
