import { api } from "../../config/api";
import * as actionTypes from "./notificationPreferences.actionType";

/**
 * Fetch notification preferences
 * Auto-creates defaults if none exist
 */
export const fetchNotificationPreferences = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_REQUEST });

  try {
    const { data } = await api.get("/api/notification-preferences");

    dispatch({
      type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: data,
    });
    console.log("Fetched notification preferences:", data);
    return data;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    dispatch({
      type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

/**
 * Update notification preferences (partial update)
 * Only sends fields that need to be updated
 */
export const updateNotificationPreference = (updates) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_REQUEST });

  try {
    const { data } = await api.put("/api/notification-preferences", updates);

    dispatch({
      type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
      payload: data,
    });
    console.log("Updated notification preferences:", data);
    return data;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    dispatch({
      type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};

/**
 * Reset notification preferences to defaults
 */
export const resetNotificationPreferences = () => async (dispatch) => {
  dispatch({ type: actionTypes.RESET_NOTIFICATION_PREFERENCES_REQUEST });

  try {
    const { data } = await api.post("/api/notification-preferences/reset");

    dispatch({
      type: actionTypes.RESET_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: data,
    });
    console.log("Reset notification preferences to defaults:", data);
    return data;
  } catch (error) {
    console.error("Error resetting notification preferences:", error);
    dispatch({
      type: actionTypes.RESET_NOTIFICATION_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};

/**
 * Delete notification preferences
 */
export const deleteNotificationPreferences = () => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_REQUEST });

  try {
    await api.delete("/api/notification-preferences");

    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_SUCCESS,
    });
    console.log("Deleted notification preferences successfully");
  } catch (error) {
    console.error("Error deleting notification preferences:", error);
    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};

/**
 * Check if notification preferences exist
 */
export const checkNotificationPreferencesExist = () => async (dispatch) => {
  dispatch({
    type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_REQUEST,
  });

  try {
    const { data } = await api.get("/api/notification-preferences/exists");

    dispatch({
      type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_SUCCESS,
      payload: data,
    });
    console.log("Notification preferences exist check:", data);
    return data;
  } catch (error) {
    console.error("Error checking notification preferences existence:", error);
    dispatch({
      type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};

/**
 * Create default notification preferences
 */
export const createDefaultNotificationPreferences = () => async (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_REQUEST,
  });

  try {
    const { data } = await api.post("/api/notification-preferences/default");

    dispatch({
      type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: data,
    });
    console.log("Created default notification preferences:", data);
    return data;
  } catch (error) {
    console.error("Error creating default notification preferences:", error);
    dispatch({
      type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return error;
  }
};
