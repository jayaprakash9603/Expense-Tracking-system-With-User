import { api } from "../../config/api";
import {
  GET_AUDIT_LOGS_REQUEST,
  GET_AUDIT_LOGS_SUCCESS,
  GET_AUDIT_LOGS_FAILURE,
  SEND_AUDIT_LOGS_EMAIL_REQUEST,
  SEND_AUDIT_LOGS_EMAIL_SUCCESS,
  SEND_AUDIT_LOGS_EMAIL_FAILURE,
} from "./auditLogs.actionType";

export const getAllAuditLogs =
  (targetId = null) =>
  async (dispatch) => {
    dispatch({ type: GET_AUDIT_LOGS_REQUEST });
    try {
      const params = targetId ? `?targetId=${targetId}` : "";
      const { data } = await api.get(`/api/audit-logs/all${params}`);
      dispatch({ type: GET_AUDIT_LOGS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_AUDIT_LOGS_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const getAuditLogsByFilter = (filters) => async (dispatch) => {
  dispatch({ type: GET_AUDIT_LOGS_REQUEST });
  try {
    let endpoint = "/api/audit-logs/";
    let params = "";

    switch (filters.logType) {
      case "today":
        endpoint += "today";
        break;
      case "yesterday":
        endpoint += "yesterday";
        break;
      case "current-week":
        endpoint += "current-week";
        break;
      case "last-week":
        endpoint += "last-week";
        break;
      case "current-month":
        endpoint += "current-month";
        break;
      case "last-month":
        endpoint += "last-month";
        break;
      case "current-year":
        endpoint += "current-year";
        break;
      case "last-year":
        endpoint += "last-year";
        break;
      case "specific-date":
        endpoint += "day";
        params = `?date=${filters.specificDate?.toISOString().split("T")[0]}`;
        break;
      case "specific-year":
        endpoint += `year/${filters.year}`;
        break;
      case "specific-month":
        endpoint += "month";
        params = `?year=${filters.year}&month=${filters.month}`;
        break;
      case "action-type":
        endpoint += `action/${filters.actionType}`;
        break;
      case "expense-id":
        endpoint += `expenses/${filters.expenseId}`;
        break;
      case "time-range":
        endpoint += `last-n-${filters.timeRange}`;
        params = `?${filters.timeRange.slice(0, -1)}=${filters.customValue}`;
        break;
      case "last-5-minutes":
        endpoint += "last-5-minutes";
        break;
      default:
        endpoint += "all";
    }

    const { data } = await api.get(`${endpoint}${params}`);
    dispatch({ type: GET_AUDIT_LOGS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_AUDIT_LOGS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const sendAuditLogsByEmail = (email, filters) => async (dispatch) => {
  dispatch({ type: SEND_AUDIT_LOGS_EMAIL_REQUEST });
  try {
    let endpoint = "/api/audit-logs/";
    let params = `email?email=${email}`;

    switch (filters.logType) {
      case "today":
        endpoint += "today/";
        break;
      case "yesterday":
        endpoint += "yesterday/";
        break;
      case "current-week":
        endpoint += "current-week/";
        break;
      case "last-week":
        endpoint += "last-week/";
        break;
      case "current-month":
        endpoint += "current-month/";
        break;
      case "last-month":
        endpoint += "last-month/";
        break;
      case "current-year":
        endpoint += "current-year/";
        break;
      case "last-year":
        endpoint += "last-year/";
        break;
      case "specific-date":
        endpoint += "day/";
        params += `&date=${filters.specificDate?.toISOString().split("T")[0]}`;
        break;
      case "specific-year":
        endpoint += `year/${filters.year}/`;
        break;
      case "specific-month":
        endpoint += "month/";
        params += `&year=${filters.year}&month=${filters.month}`;
        break;
      case "action-type":
        endpoint += `action/${filters.actionType}/`;
        break;
      case "expense-id":
        endpoint += `expenses/${filters.expenseId}/`;
        break;
      case "time-range":
        endpoint += `last-n-${filters.timeRange}/`;
        params += `&${filters.timeRange.slice(0, -1)}=${filters.customValue}`;
        break;
      case "last-5-minutes":
        endpoint += "last-5-minutes/";
        break;
      default:
        endpoint += "all/";
    }

    const { data } = await api.get(`${endpoint}${params}`);
    dispatch({ type: SEND_AUDIT_LOGS_EMAIL_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: SEND_AUDIT_LOGS_EMAIL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};
