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
  FETCH_BILLS_CALENDAR_REQUEST,
  FETCH_BILLS_CALENDAR_SUCCESS,
  FETCH_BILLS_CALENDAR_FAILURE,
  GET_BILLS_BY_DATE_REQUEST,
  GET_BILLS_BY_DATE_SUCCESS,
  GET_BILLS_BY_DATE_FAILURE,
  GET_BILL_BY_EXPENSE_ID_REQUEST,
  GET_BILL_BY_EXPENSE_ID_SUCCESS,
  GET_BILL_BY_EXPENSE_ID_FAILURE,
  SCAN_RECEIPT_REQUEST,
  SCAN_RECEIPT_SUCCESS,
  SCAN_RECEIPT_FAILURE,
  CLEAR_SCAN_RESULT,
  UPDATE_SCAN_FIELD,
  CHECK_OCR_STATUS_REQUEST,
  CHECK_OCR_STATUS_SUCCESS,
  CHECK_OCR_STATUS_FAILURE,
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

export const fetchAllBills =
  (targetId = null, filters = {}) =>
  async (dispatch) => {
    dispatch({ type: FETCH_BILLS_REQUEST });
    try {
      const params = { ...(filters || {}) };
      if (targetId) {
        params.targetId = targetId;
      }

      Object.keys(params).forEach((key) => {
        if (
          params[key] === undefined ||
          params[key] === null ||
          params[key] === ""
        ) {
          delete params[key];
        }
      });

      const config = { params };
      const response = await api.get(`api/bills`, config);
      console.log("Fetched Bills:", response.data); // Debug log
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
export const createBill = (billData, targetId) => async (dispatch) => {
  dispatch({ type: CREATE_BILL_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: targetId ? { targetId } : {},
    };

    const response = await api.post(`api/bills`, billData, config);
    dispatch({
      type: CREATE_BILL_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_BILL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update an existing bill
export const updateBill = (billId, billData, targetId) => async (dispatch) => {
  dispatch({ type: UPDATE_BILL_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: targetId ? { targetId } : {},
    };

    const response = await api.put(`api/bills/${billId}`, billData, config);
    dispatch({
      type: UPDATE_BILL_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: UPDATE_BILL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete a bill
export const deleteBill = (billId, targetId) => async (dispatch) => {
  dispatch({ type: DELETE_BILL_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: targetId ? { targetId } : {},
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
export const getBillById = (billId, targetId) => async (dispatch) => {
  dispatch({ type: GET_BILL_BY_ID_REQUEST });
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: targetId ? { targetId } : {},
    };

    const response = await api.get(`api/bills/${billId}`, config);
    dispatch({
      type: GET_BILL_BY_ID_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: GET_BILL_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const fetchBillsForCalendar =
  (range, offset, friendId) => async (dispatch) => {
    dispatch({ type: FETCH_BILLS_CALENDAR_REQUEST });
    try {
      const params = new URLSearchParams({
        range,
        offset: offset.toString(),
      });

      if (friendId) {
        params.append("targetId", friendId);
      }

      const { data } = await api.get(`/api/bills?${params.toString()}`);

      dispatch({
        type: FETCH_BILLS_CALENDAR_SUCCESS,
        payload: data,
      });
    } catch (error) {
      console.error("Error fetching bills calendar data:", error);
      dispatch({
        type: FETCH_BILLS_CALENDAR_FAILURE,

        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const getBillByExpenseId = (expenseId, friendId = "") => async (dispatch) => {
  {
    dispatch({ type: GET_BILL_BY_EXPENSE_ID_REQUEST });
    try {
      const { data } = await api.get(`/api/bills/expenses/${expenseId}`, {
        params: {
          targetId: friendId || "",
        },
      });

      dispatch({
        type: GET_BILL_BY_EXPENSE_ID_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      dispatch({
        type: GET_BILL_BY_EXPENSE_ID_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  }
};

export const getBillsByParticularDate =
  (expenseDate, friendId = "") =>
  async (dispatch) => {
    dispatch({ type: GET_BILLS_BY_DATE_REQUEST });
    try {
      const config = {
        params: {
          expenseDate,
          targetId: friendId || "",
        },
      };

      const { data } = await api.get("/api/bills", config);

      // Filter bills for the specific date
      const filteredBills = data.filter((bill) => bill.date === expenseDate);

      dispatch({
        type: GET_BILLS_BY_DATE_SUCCESS,
        payload: filteredBills,
      });
      return filteredBills;
    } catch (error) {
      dispatch({
        type: GET_BILLS_BY_DATE_FAILURE,
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

// Bulk: start a tracked save for bills and return jobId
export const startTrackedSaveBills = (bills, targetId) => async () => {
  const { data } = await api.post(`/api/bills/add-multiple/tracked`, bills, {
    params: { targetId: targetId || "" },
  });
  return data?.jobId;
};

// Bulk: poll progress for a bills jobId
export const pollBillsSaveProgress = async (jobId) => {
  const { data } = await api.get(`/api/bills/add-multiple/progress/${jobId}`);
  return data; // { jobId, total, processed, percent, status, message }
};

// ==================== OCR RECEIPT SCANNING ====================

/**
 * Scans a receipt image using OCR and extracts expense data.
 * @param {File} file - The receipt image file
 * @returns {Promise} - Resolves with extracted receipt data
 */
export const scanReceipt = (file) => async (dispatch) => {
  dispatch({ type: SCAN_RECEIPT_REQUEST });

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`api/bills/scan-receipt`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: SCAN_RECEIPT_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to scan receipt";

    dispatch({
      type: SCAN_RECEIPT_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Scans multiple receipt images (pages) using OCR and merges results.
 * Useful for multi-page receipts like Star Bazaar/Trent Hypermarket bills.
 * @param {File[]} files - Array of receipt image files
 * @returns {Promise} - Resolves with merged extracted receipt data
 */
export const scanMultipleReceipts = (files) => async (dispatch) => {
  dispatch({ type: SCAN_RECEIPT_REQUEST });

  try {
    const formData = new FormData();

    // Append all files to FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `api/bills/scan-receipt/multiple`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    dispatch({
      type: SCAN_RECEIPT_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to scan receipts";

    dispatch({
      type: SCAN_RECEIPT_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Clears the current scan result from state.
 */
export const clearScanResult = () => ({
  type: CLEAR_SCAN_RESULT,
});

/**
 * Updates a field in the scanned receipt data (for manual overrides).
 * @param {string} field - The field name to update
 * @param {any} value - The new value
 */
export const updateScanField = (field, value) => ({
  type: UPDATE_SCAN_FIELD,
  payload: { field, value },
});

/**
 * Checks if the OCR service is available.
 * @returns {Promise} - Resolves with OCR status
 */
export const checkOcrStatus = () => async (dispatch) => {
  dispatch({ type: CHECK_OCR_STATUS_REQUEST });

  try {
    const response = await api.get(`api/bills/ocr/status`);

    dispatch({
      type: CHECK_OCR_STATUS_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: CHECK_OCR_STATUS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });

    return { available: false };
  }
};
