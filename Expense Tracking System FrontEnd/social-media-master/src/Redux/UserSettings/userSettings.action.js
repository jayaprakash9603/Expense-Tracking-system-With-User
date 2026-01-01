import { api } from "../../config/api";
import { safeApiCall } from "../../utils/safeApiCall";
import * as actionTypes from "./userSettings.actionType";

// Fetch User Settings
export const getUserSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_USER_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() => api.get(`/api/settings`));

  if (error) {
    const message = error.message || "Failed to fetch settings";
    console.error("Error fetching user settings:", error);
    dispatch({
      type: actionTypes.FETCH_USER_SETTINGS_FAILURE,
      payload: message,
    });
    return error;
  }

  dispatch({
    type: actionTypes.FETCH_USER_SETTINGS_SUCCESS,
    payload: data,
  });

  return data;
};

// Update User Settings (Partial Update)
export const updateUserSettings = (settingsData) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_USER_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.put(`/api/settings`, settingsData)
  );

  if (error) {
    const message = error.message || "Failed to update settings";
    console.error("Error updating user settings:", error);
    dispatch({
      type: actionTypes.UPDATE_USER_SETTINGS_FAILURE,
      payload: message,
    });
    return error;
  }

  dispatch({
    type: actionTypes.UPDATE_USER_SETTINGS_SUCCESS,
    payload: data,
  });

  return data;
};

// Create Default Settings
export const createDefaultSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.CREATE_DEFAULT_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post(`/api/settings/default`, {})
  );

  if (error) {
    const message = error.message || "Failed to create default settings";
    console.error("Error creating default settings:", error);
    dispatch({
      type: actionTypes.CREATE_DEFAULT_SETTINGS_FAILURE,
      payload: message,
    });
    return error;
  }

  dispatch({
    type: actionTypes.CREATE_DEFAULT_SETTINGS_SUCCESS,
    payload: data,
  });

  return data;
};

// Reset Settings to Default
export const resetUserSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.RESET_USER_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post(`/api/settings/reset`, {})
  );

  if (error) {
    const message = error.message || "Failed to reset settings";
    console.error("Error resetting user settings:", error);
    dispatch({
      type: actionTypes.RESET_USER_SETTINGS_FAILURE,
      payload: message,
    });
    return error;
  }

  dispatch({
    type: actionTypes.RESET_USER_SETTINGS_SUCCESS,
    payload: data,
  });

  return data;
};

// Check if Settings Exist
export const checkSettingsExist = () => async (dispatch) => {
  dispatch({ type: actionTypes.CHECK_SETTINGS_EXIST_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.get(`/api/settings/exists`)
  );

  if (error) {
    const message = error.message || "Failed to check settings";
    console.error("Error checking settings existence:", error);
    dispatch({
      type: actionTypes.CHECK_SETTINGS_EXIST_FAILURE,
      payload: message,
    });
    return error;
  }

  dispatch({
    type: actionTypes.CHECK_SETTINGS_EXIST_SUCCESS,
    payload: data,
  });

  return data;
};

// Fetch or Create Settings (Smart Action for Login)
export const fetchOrCreateUserSettings = () => async (dispatch) => {
  try {
    // First, try to fetch existing settings
    const settings = await dispatch(getUserSettings());
    return settings;
  } catch (error) {
    // If settings don't exist (404), create default settings
    if (error?.status === 404) {
      console.log("Settings not found, creating default settings...");
      const defaultSettings = await dispatch(createDefaultSettings());
      return defaultSettings;
    }
    // For other errors, rereturn
    return error;
  }
};

// Clear Settings (on logout)
export const clearUserSettings = () => ({
  type: actionTypes.CLEAR_USER_SETTINGS,
});
