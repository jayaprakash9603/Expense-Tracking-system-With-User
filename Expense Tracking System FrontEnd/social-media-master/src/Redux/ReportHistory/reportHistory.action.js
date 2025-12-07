import { api } from "../../config/api";
import * as actionTypes from "./reportHistory.actionTypes";

// Fetch all report history
export const fetchReportHistory = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_REPORT_HISTORY_REQUEST });

  try {
    const { data } = await api.get("/api/expenses/reports/history");

    dispatch({
      type: actionTypes.FETCH_REPORT_HISTORY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch report history";

    dispatch({
      type: actionTypes.FETCH_REPORT_HISTORY_FAILURE,
      payload: errorMessage,
    });

    console.error("Report history fetch error:", error);
  }
};

// Fetch report history by status (SUCCESS or FAILED)
export const fetchReportHistoryByStatus = (status) => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_REQUEST });

  try {
    const { data } = await api.get(
      `/api/expenses/reports/history/status/${status}`
    );

    dispatch({
      type: actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to fetch report history by status";

    dispatch({
      type: actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_FAILURE,
      payload: errorMessage,
    });

    console.error("Report history by status fetch error:", error);
  }
};

// Fetch recent report history (last 10)
export const fetchRecentReportHistory = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_RECENT_REPORT_HISTORY_REQUEST });

  try {
    const { data } = await api.get("/api/expenses/reports/history/recent");

    dispatch({
      type: actionTypes.FETCH_RECENT_REPORT_HISTORY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch recent report history";

    dispatch({
      type: actionTypes.FETCH_RECENT_REPORT_HISTORY_FAILURE,
      payload: errorMessage,
    });

    console.error("Recent report history fetch error:", error);
  }
};

// Fetch report statistics
export const fetchReportStatistics = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_REPORT_STATISTICS_REQUEST });

  try {
    const { data } = await api.get("/api/expenses/reports/history/stats");

    dispatch({
      type: actionTypes.FETCH_REPORT_STATISTICS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch report statistics";

    dispatch({
      type: actionTypes.FETCH_REPORT_STATISTICS_FAILURE,
      payload: errorMessage,
    });

    console.error("Report statistics fetch error:", error);
  }
};

// Fetch report history by date range
export const fetchReportHistoryByDateRange =
  (startDate, endDate) => async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_REQUEST });

    try {
      const { data } = await api.get(
        `/api/expenses/reports/history/range?startDate=${startDate}&endDate=${endDate}`
      );

      dispatch({
        type: actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch report history by date range";

      dispatch({
        type: actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_FAILURE,
        payload: errorMessage,
      });

      console.error("Report history by date range fetch error:", error);
    }
  };

// Clear report history
export const clearReportHistory = () => ({
  type: actionTypes.CLEAR_REPORT_HISTORY,
});
