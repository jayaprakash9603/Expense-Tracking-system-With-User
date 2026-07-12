import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";
import * as types from "./userSettings.actionTypes";

export const getUserSettings = () => async (dispatch) => {
  dispatch({ type: types.FETCH_USER_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() => api.get("/api/settings"));

  if (error) {
    dispatch({ type: types.FETCH_USER_SETTINGS_FAILURE, payload: error.message });
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  dispatch({ type: types.FETCH_USER_SETTINGS_SUCCESS, payload: data });
  return { success: true, data };
};

export const updateUserSettings = (settingsData, previousSettingsData) => async (dispatch) => {
  dispatch({ type: types.UPDATE_USER_SETTINGS_REQUEST });

  if (Object.prototype.hasOwnProperty.call(settingsData || {}, "twoFactorEnabled")) {
    const { error: tfaError } = await safeApiCall(() =>
      api.put("/api/user/two-factor", { enabled: settingsData.twoFactorEnabled }),
    );

    if (tfaError) {
      dispatch({ type: types.UPDATE_USER_SETTINGS_FAILURE, payload: tfaError.message });
      return { success: false, error: tfaError.message };
    }
  }

  const { data, error } = await safeApiCall(() => api.put("/api/settings", settingsData));

  if (error) {
    if (
      Object.prototype.hasOwnProperty.call(settingsData || {}, "twoFactorEnabled") &&
      Object.prototype.hasOwnProperty.call(previousSettingsData || {}, "twoFactorEnabled")
    ) {
      await safeApiCall(() =>
        api.put("/api/user/two-factor", { enabled: previousSettingsData.twoFactorEnabled }),
      );
    }

    dispatch({ type: types.UPDATE_USER_SETTINGS_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }

  dispatch({ type: types.UPDATE_USER_SETTINGS_SUCCESS, payload: data });
  return { success: true, data };
};

export const createDefaultSettings = () => async (dispatch) => {
  dispatch({ type: types.CREATE_DEFAULT_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() => api.post("/api/settings/default", {}));

  if (error) {
    dispatch({ type: types.CREATE_DEFAULT_SETTINGS_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }

  dispatch({ type: types.CREATE_DEFAULT_SETTINGS_SUCCESS, payload: data });
  return { success: true, data };
};

export const resetUserSettings = () => async (dispatch) => {
  dispatch({ type: types.RESET_USER_SETTINGS_REQUEST });

  const { data, error } = await safeApiCall(() => api.post("/api/settings/reset", {}));

  if (error) {
    dispatch({ type: types.RESET_USER_SETTINGS_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }

  dispatch({ type: types.RESET_USER_SETTINGS_SUCCESS, payload: data });
  return { success: true, data };
};

export const checkSettingsExist = () => async (dispatch) => {
  dispatch({ type: types.CHECK_SETTINGS_EXIST_REQUEST });

  const { data, error } = await safeApiCall(() => api.get("/api/settings/exists"));

  if (error) {
    dispatch({ type: types.CHECK_SETTINGS_EXIST_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }

  dispatch({ type: types.CHECK_SETTINGS_EXIST_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchOrCreateUserSettings = () => async (dispatch) => {
  const result = await dispatch(getUserSettings());
  if (result.success) {
    return result;
  }
  if (result.status === 404) {
    return dispatch(createDefaultSettings());
  }
  return result;
};

export const clearUserSettings = () => ({ type: types.CLEAR_USER_SETTINGS });
