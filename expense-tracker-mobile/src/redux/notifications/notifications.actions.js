import {
  notificationService,
  normalizeNotification,
} from "@/domain/notifications/notificationService";
import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
  FETCH_UNREAD_COUNT_SUCCESS,
  ADD_REALTIME_NOTIFICATION,
  DISMISS_FLOATING_NOTIFICATION,
  CLEAR_NOTIFICATION_ERROR,
  RESET_NOTIFICATION_STATE,
} from "./notifications.actionTypes";

export const fetchNotificationsAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });
  const { data, error } = await notificationService.list(params);
  if (error) {
    dispatch({ type: FETCH_NOTIFICATIONS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_NOTIFICATIONS_SUCCESS, payload: data });
  return { success: true, data };
};

export const markNotificationReadAction = (id) => async (dispatch) => {
  const { data, error } = await notificationService.markRead(id);
  if (error) return { success: false, error };
  dispatch({ type: MARK_NOTIFICATION_READ_SUCCESS, payload: id });
  return { success: true, data };
};

export const markAllNotificationsReadAction = () => async (dispatch) => {
  const { error } = await notificationService.markAllRead();
  if (error) return { success: false, error };
  dispatch({ type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS });
  return { success: true };
};

export const deleteNotificationAction = (id) => async (dispatch) => {
  const { error } = await notificationService.remove(id);
  if (error) return { success: false, error };
  dispatch({ type: DELETE_NOTIFICATION_SUCCESS, payload: id });
  return { success: true };
};

export const fetchUnreadCountAction = () => async (dispatch) => {
  const { data, error } = await notificationService.unreadCount();
  if (error) return { success: false, error };
  dispatch({ type: FETCH_UNREAD_COUNT_SUCCESS, payload: data });
  return { success: true, data };
};

export const addRealtimeNotificationAction = (notificationPayload) => {
  const normalized = normalizeNotification(notificationPayload);
  if (!normalized) {
    return { type: CLEAR_NOTIFICATION_ERROR };
  }

  return {
    type: ADD_REALTIME_NOTIFICATION,
    payload: normalized,
  };
};

export const dismissFloatingNotificationAction = (id) => ({
  type: DISMISS_FLOATING_NOTIFICATION,
  payload: id,
});

export const clearNotificationError = () => ({ type: CLEAR_NOTIFICATION_ERROR });
export const resetNotificationState = () => ({
  type: RESET_NOTIFICATION_STATE,
});
