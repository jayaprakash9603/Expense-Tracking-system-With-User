import axios from "axios";
import * as actionTypes from "./userSettings.actionType";

const API_BASE_URL = "http://localhost:8080";

// Get authorization header
const getAuthHeader = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
};

// Fetch User Settings
export const getUserSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_USER_SETTINGS_REQUEST });

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/settings`, {
      headers: getAuthHeader(),
    });

    dispatch({
      type: actionTypes.FETCH_USER_SETTINGS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    dispatch({
      type: actionTypes.FETCH_USER_SETTINGS_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch settings",
    });
    throw error;
  }
};

// Update User Settings (Partial Update)
export const updateUserSettings = (settingsData) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_USER_SETTINGS_REQUEST });

  try {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/settings`,
      settingsData,
      {
        headers: getAuthHeader(),
      }
    );

    dispatch({
      type: actionTypes.UPDATE_USER_SETTINGS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error updating user settings:", error);
    dispatch({
      type: actionTypes.UPDATE_USER_SETTINGS_FAILURE,
      payload: error.response?.data?.message || "Failed to update settings",
    });
    throw error;
  }
};

// Create Default Settings
export const createDefaultSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.CREATE_DEFAULT_SETTINGS_REQUEST });

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/settings/default`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    dispatch({
      type: actionTypes.CREATE_DEFAULT_SETTINGS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error creating default settings:", error);
    dispatch({
      type: actionTypes.CREATE_DEFAULT_SETTINGS_FAILURE,
      payload:
        error.response?.data?.message || "Failed to create default settings",
    });
    throw error;
  }
};

// Reset Settings to Default
export const resetUserSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.RESET_USER_SETTINGS_REQUEST });

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/settings/reset`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    dispatch({
      type: actionTypes.RESET_USER_SETTINGS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error resetting user settings:", error);
    dispatch({
      type: actionTypes.RESET_USER_SETTINGS_FAILURE,
      payload: error.response?.data?.message || "Failed to reset settings",
    });
    throw error;
  }
};

// Check if Settings Exist
export const checkSettingsExist = () => async (dispatch) => {
  dispatch({ type: actionTypes.CHECK_SETTINGS_EXIST_REQUEST });

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/settings/exists`, {
      headers: getAuthHeader(),
    });

    dispatch({
      type: actionTypes.CHECK_SETTINGS_EXIST_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error checking settings existence:", error);
    dispatch({
      type: actionTypes.CHECK_SETTINGS_EXIST_FAILURE,
      payload: error.response?.data?.message || "Failed to check settings",
    });
    throw error;
  }
};

// Fetch or Create Settings (Smart Action for Login)
export const fetchOrCreateUserSettings = () => async (dispatch) => {
  try {
    // First, try to fetch existing settings
    const settings = await dispatch(getUserSettings());
    return settings;
  } catch (error) {
    // If settings don't exist (404), create default settings
    if (error.response?.status === 404) {
      console.log("Settings not found, creating default settings...");
      const defaultSettings = await dispatch(createDefaultSettings());
      return defaultSettings;
    }
    // For other errors, rethrow
    throw error;
  }
};

// Clear Settings (on logout)
export const clearUserSettings = () => ({
  type: actionTypes.CLEAR_USER_SETTINGS,
});
