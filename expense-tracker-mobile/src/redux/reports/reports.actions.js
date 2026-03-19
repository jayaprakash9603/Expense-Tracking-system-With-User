import { reportApi } from "@/infrastructure/api";
import {
  GENERATE_REPORT_REQUEST,
  GENERATE_REPORT_SUCCESS,
  GENERATE_REPORT_FAILURE,
  FETCH_REPORT_HISTORY_REQUEST,
  FETCH_REPORT_HISTORY_SUCCESS,
  FETCH_REPORT_HISTORY_FAILURE,
  DELETE_REPORT_SUCCESS,
  CLEAR_REPORT_ERROR,
  RESET_REPORT_STATE,
} from "./reports.actionTypes";

export const generateReportAction = (reportData) => async (dispatch) => {
  dispatch({ type: GENERATE_REPORT_REQUEST });
  const { data, error } = await reportApi.generate(reportData);
  if (error) {
    dispatch({ type: GENERATE_REPORT_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: GENERATE_REPORT_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchReportHistoryAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_REPORT_HISTORY_REQUEST });
  const { data, error } = await reportApi.getHistory(params);
  if (error) {
    dispatch({ type: FETCH_REPORT_HISTORY_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_REPORT_HISTORY_SUCCESS, payload: data });
  return { success: true, data };
};

export const deleteReportAction = (id) => async (dispatch) => {
  const { error } = await reportApi.delete(id);
  if (error) return { success: false, error };
  dispatch({ type: DELETE_REPORT_SUCCESS, payload: id });
  return { success: true };
};

export const clearReportError = () => ({ type: CLEAR_REPORT_ERROR });
export const resetReportState = () => ({ type: RESET_REPORT_STATE });
