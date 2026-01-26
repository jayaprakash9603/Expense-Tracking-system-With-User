/**
 * Keyboard Shortcuts Redux Actions
 *
 * Actions for syncing keyboard shortcuts with the backend.
 */

import { api } from "../../config/api";

// Action Types
export const SHORTCUTS_FETCH_REQUEST = "SHORTCUTS_FETCH_REQUEST";
export const SHORTCUTS_FETCH_SUCCESS = "SHORTCUTS_FETCH_SUCCESS";
export const SHORTCUTS_FETCH_FAILURE = "SHORTCUTS_FETCH_FAILURE";

export const SHORTCUTS_UPDATE_REQUEST = "SHORTCUTS_UPDATE_REQUEST";
export const SHORTCUTS_UPDATE_SUCCESS = "SHORTCUTS_UPDATE_SUCCESS";
export const SHORTCUTS_UPDATE_FAILURE = "SHORTCUTS_UPDATE_FAILURE";

export const SHORTCUTS_RESET_REQUEST = "SHORTCUTS_RESET_REQUEST";
export const SHORTCUTS_RESET_SUCCESS = "SHORTCUTS_RESET_SUCCESS";
export const SHORTCUTS_RESET_FAILURE = "SHORTCUTS_RESET_FAILURE";

export const RECOMMENDATIONS_FETCH_REQUEST = "RECOMMENDATIONS_FETCH_REQUEST";
export const RECOMMENDATIONS_FETCH_SUCCESS = "RECOMMENDATIONS_FETCH_SUCCESS";
export const RECOMMENDATIONS_FETCH_FAILURE = "RECOMMENDATIONS_FETCH_FAILURE";

/**
 * Fetch user's shortcut configurations
 */
export const fetchShortcuts = () => async (dispatch) => {
  dispatch({ type: SHORTCUTS_FETCH_REQUEST });

  try {
    const { data } = await api.get("/api/shortcuts");

    dispatch({
      type: SHORTCUTS_FETCH_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch shortcuts";

    dispatch({
      type: SHORTCUTS_FETCH_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Update shortcut configurations
 */
export const updateShortcuts = (updates) => async (dispatch) => {
  dispatch({ type: SHORTCUTS_UPDATE_REQUEST });

  try {
    const { data } = await api.post("/api/shortcuts/update", {
      shortcuts: updates,
    });

    dispatch({
      type: SHORTCUTS_UPDATE_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update shortcuts";

    dispatch({
      type: SHORTCUTS_UPDATE_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Reset shortcuts to defaults
 */
export const resetShortcuts = () => async (dispatch) => {
  dispatch({ type: SHORTCUTS_RESET_REQUEST });

  try {
    const { data } = await api.post("/api/shortcuts/reset");

    dispatch({
      type: SHORTCUTS_RESET_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset shortcuts";

    dispatch({
      type: SHORTCUTS_RESET_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Fetch shortcut recommendations
 */
export const fetchRecommendations = () => async (dispatch) => {
  dispatch({ type: RECOMMENDATIONS_FETCH_REQUEST });

  try {
    const { data } = await api.get("/api/shortcuts/recommendations");

    dispatch({
      type: RECOMMENDATIONS_FETCH_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch recommendations";

    dispatch({
      type: RECOMMENDATIONS_FETCH_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Track shortcut usage
 */
export const trackShortcutUsage = (actionId) => async () => {
  try {
    await api.post(
      `/api/shortcuts/track?actionId=${encodeURIComponent(actionId)}`,
    );
  } catch (error) {
    console.warn("Failed to track shortcut usage:", error);
  }
};

/**
 * Accept a recommendation
 */
export const acceptRecommendation = (actionId) => async (dispatch) => {
  try {
    const { data } = await api.post(
      `/api/shortcuts/recommendations/${actionId}/accept`,
    );

    dispatch({
      type: SHORTCUTS_UPDATE_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Failed to accept recommendation:", error);
    throw error;
  }
};

/**
 * Reject a recommendation
 */
export const rejectRecommendation = (actionId) => async (dispatch) => {
  try {
    const { data } = await api.post(
      `/api/shortcuts/recommendations/${actionId}/reject`,
    );

    dispatch({
      type: SHORTCUTS_UPDATE_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Failed to reject recommendation:", error);
    throw error;
  }
};
