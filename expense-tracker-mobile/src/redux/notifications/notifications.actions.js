import { notificationApi } from "@/infrastructure/api";
import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
  FETCH_UNREAD_COUNT_SUCCESS,
  CLEAR_NOTIFICATION_ERROR,
  RESET_NOTIFICATION_STATE,
} from "./notifications.actionTypes";

export const fetchNotificationsAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });
  const { data, error } = await notificationApi.getAll(params);
  if (error) {
    dispatch({ type: FETCH_NOTIFICATIONS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_NOTIFICATIONS_SUCCESS, payload: data });
  return { success: true, data };
};

export const markNotificationReadAction = (id) => async (dispatch) => {
  const { data, error } = await notificationApi.markRead(id);
  if (error) return { success: false, error };
  dispatch({ type: MARK_NOTIFICATION_READ_SUCCESS, payload: id });
  return { success: true, data };
};

export const markAllNotificationsReadAction = () => async (dispatch) => {
  const { error } = await notificationApi.markAllRead();
  if (error) return { success: false, error };
  dispatch({ type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS });
  return { success: true };
};

export const deleteNotificationAction = (id) => async (dispatch) => {
  const { error } = await notificationApi.delete(id);
  if (error) return { success: false, error };
  dispatch({ type: DELETE_NOTIFICATION_SUCCESS, payload: id });
  return { success: true };
};

export const fetchUnreadCountAction = () => async (dispatch) => {
  const { data, error } = await notificationApi.getUnreadCount();
  if (error) return { success: false, error };
  dispatch({ type: FETCH_UNREAD_COUNT_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearNotificationError = () => ({ type: CLEAR_NOTIFICATION_ERROR });
export const resetNotificationState = () => ({
  type: RESET_NOTIFICATION_STATE,
});
