import { api } from "../../config/api";
import * as actionTypes from "./notification.actionType";

// Base URL for notification service endpoints
const NOTIFICATION_BASE_PATH = "/api/notifications";

// ==========================================
// FETCH ALL NOTIFICATIONS
// ==========================================
export const fetchNotifications = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_NOTIFICATIONS_REQUEST });

  try {
    const { data } = await api.get(NOTIFICATION_BASE_PATH);

    dispatch({
      type: actionTypes.FETCH_NOTIFICATIONS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch notifications";

    dispatch({
      type: actionTypes.FETCH_NOTIFICATIONS_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// FETCH UNREAD NOTIFICATIONS
// ==========================================
export const fetchUnreadNotifications = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_UNREAD_NOTIFICATIONS_REQUEST });

  try {
    const { data } = await api.get(`${NOTIFICATION_BASE_PATH}/unread`);

    dispatch({
      type: actionTypes.FETCH_UNREAD_NOTIFICATIONS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch unread notifications";

    dispatch({
      type: actionTypes.FETCH_UNREAD_NOTIFICATIONS_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// FETCH UNREAD COUNT
// ==========================================
export const fetchUnreadCount = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_UNREAD_COUNT_REQUEST });

  try {
    const { data } = await api.get(`${NOTIFICATION_BASE_PATH}/count/unread`);

    dispatch({
      type: actionTypes.FETCH_UNREAD_COUNT_SUCCESS,
      payload: data.unreadCount,
    });

    return data.unreadCount;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch unread count";

    dispatch({
      type: actionTypes.FETCH_UNREAD_COUNT_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  dispatch({ type: actionTypes.MARK_NOTIFICATION_READ_REQUEST });

  try {
    const { data } = await api.put(
      `${NOTIFICATION_BASE_PATH}/${notificationId}/read`,
    );

    dispatch({
      type: actionTypes.MARK_NOTIFICATION_READ_SUCCESS,
      payload: notificationId,
    });

    // Also update the unread count
    dispatch(fetchUnreadCount());

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to mark notification as read";

    dispatch({
      type: actionTypes.MARK_NOTIFICATION_READ_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================
export const markAllNotificationsAsRead = () => async (dispatch) => {
  dispatch({ type: actionTypes.MARK_ALL_READ_REQUEST });

  try {
    const { data } = await api.put(`${NOTIFICATION_BASE_PATH}/read-all`);

    dispatch({
      type: actionTypes.MARK_ALL_READ_SUCCESS,
    });

    // Refresh notifications and unread count
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to mark all notifications as read";

    dispatch({
      type: actionTypes.MARK_ALL_READ_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================
export const deleteNotification = (notificationId) => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_NOTIFICATION_REQUEST });

  try {
    const { data } = await api.delete(
      `${NOTIFICATION_BASE_PATH}/${notificationId}`,
    );

    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_SUCCESS,
      payload: notificationId,
    });

    // Update unread count
    dispatch(fetchUnreadCount());

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete notification";

    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// DELETE ALL NOTIFICATIONS
// ==========================================
export const deleteAllNotifications = () => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST });

  try {
    const { data } = await api.delete(`${NOTIFICATION_BASE_PATH}/all`);

    dispatch({
      type: actionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS,
    });

    // Reset unread count
    dispatch({
      type: actionTypes.FETCH_UNREAD_COUNT_SUCCESS,
      payload: 0,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete all notifications";

    dispatch({
      type: actionTypes.DELETE_ALL_NOTIFICATIONS_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// FETCH NOTIFICATION PREFERENCES
// ==========================================
export const fetchNotificationPreferences = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_PREFERENCES_REQUEST });

  try {
    const { data } = await api.get(`${NOTIFICATION_BASE_PATH}/preferences`);

    dispatch({
      type: actionTypes.FETCH_PREFERENCES_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch preferences";

    dispatch({
      type: actionTypes.FETCH_PREFERENCES_FAILURE,
      payload: errorMessage,
    });

    return error;
  }
};

// ==========================================
// UPDATE NOTIFICATION PREFERENCES
// ==========================================
export const updateNotificationPreferences =
  (preferences) => async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PREFERENCES_REQUEST });

    try {
      const { data } = await api.put(
        `${NOTIFICATION_BASE_PATH}/preferences`,
        preferences,
      );

      dispatch({
        type: actionTypes.UPDATE_PREFERENCES_SUCCESS,
        payload: preferences,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update preferences";

      dispatch({
        type: actionTypes.UPDATE_PREFERENCES_FAILURE,
        payload: errorMessage,
      });

      return error;
    }
  };

// ==========================================
// SEND TEST NOTIFICATION
// ==========================================
export const sendTestNotification =
  (message, alertType = "TEST") =>
  async (dispatch) => {
    dispatch({ type: actionTypes.SEND_TEST_NOTIFICATION_REQUEST });

    try {
      const { data } = await api.post(`${NOTIFICATION_BASE_PATH}/test`, {
        message,
        alertType,
      });

      dispatch({
        type: actionTypes.SEND_TEST_NOTIFICATION_SUCCESS,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send test notification";

      dispatch({
        type: actionTypes.SEND_TEST_NOTIFICATION_FAILURE,
        payload: errorMessage,
      });

      return error;
    }
  };

// ==========================================
// ADD NOTIFICATION (FROM WEBSOCKET)
// ==========================================
export const addNotification = (notification) => (dispatch) => {
  dispatch({
    type: actionTypes.ADD_NOTIFICATION,
    payload: notification,
  });

  // ✅ NO API CALL! Redux reducer handles unread count automatically
  // The reducer increments unreadCount if notification.isRead === false
};

// ==========================================
// REALTIME NOTIFICATION RECEIVED
// ==========================================
export const realtimeNotificationReceived = (notification) => (dispatch) => {
  dispatch({
    type: actionTypes.REALTIME_NOTIFICATION_RECEIVED,
    payload: notification,
  });

  // Add to notifications list
  dispatch(addNotification(notification));
};

// ==========================================
// CLEAR NOTIFICATIONS
// ==========================================
export const clearNotifications = () => (dispatch) => {
  dispatch({ type: actionTypes.CLEAR_NOTIFICATIONS });
};

// ==========================================
// FILTER NOTIFICATIONS
// ==========================================
export const filterNotifications = (filterType) => (dispatch) => {
  dispatch({
    type: actionTypes.FILTER_NOTIFICATIONS,
    payload: filterType,
  });
};

// ==========================================
// FETCH FILTERED NOTIFICATIONS
// ==========================================
export const fetchFilteredNotifications =
  (isRead = null, limit = 20, offset = 0) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_NOTIFICATIONS_REQUEST });

    try {
      const params = { limit, offset };
      if (isRead !== null) {
        params.isRead = isRead;
      }

      const { data } = await api.get(`${NOTIFICATION_BASE_PATH}/filter`, {
        params,
      });

      dispatch({
        type: actionTypes.FETCH_NOTIFICATIONS_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch filtered notifications";

      dispatch({
        type: actionTypes.FETCH_NOTIFICATIONS_FAILURE,
        payload: errorMessage,
      });

      return error;
    }
  };
