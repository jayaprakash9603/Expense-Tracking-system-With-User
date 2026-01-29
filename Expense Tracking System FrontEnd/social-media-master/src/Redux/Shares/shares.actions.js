import { api } from "../../config/api";
import { SHARES_ACTION_TYPES } from "./shares.actionTypes";

/**
 * Create a new share with QR code generation.
 * @param {Object} shareData - { resourceType, resourceRefs, permission, expiryDays, customExpiry, shareName }
 */
export const createShare = (shareData) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.CREATE_SHARE_REQUEST });

  try {
    const response = await api.post("/api/shares", shareData);

    dispatch({
      type: SHARES_ACTION_TYPES.CREATE_SHARE_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create share";

    dispatch({
      type: SHARES_ACTION_TYPES.CREATE_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Access shared data via token.
 * @param {string} token - Share token from URL
 */
export const accessShare = (token) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.ACCESS_SHARE_REQUEST });

  try {
    // Can access without auth, so use skipAuth option if not logged in
    const jwt = localStorage.getItem("jwt");
    const config = jwt ? {} : { skipAuth: true };

    const response = await api.get(`/api/shares/${token}`, config);

    dispatch({
      type: SHARES_ACTION_TYPES.ACCESS_SHARE_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.invalidReason ||
      error.response?.data?.message ||
      error.message ||
      "Failed to access share";

    dispatch({
      type: SHARES_ACTION_TYPES.ACCESS_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Validate a share token without recording access.
 * @param {string} token - Share token
 */
export const validateShare = (token) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.VALIDATE_SHARE_REQUEST });

  try {
    const response = await api.get(`/api/shares/${token}/validate`, {
      skipAuth: true,
    });

    dispatch({
      type: SHARES_ACTION_TYPES.VALIDATE_SHARE_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to validate share";

    dispatch({
      type: SHARES_ACTION_TYPES.VALIDATE_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Revoke a share (owner only).
 * @param {string} token - Share token to revoke
 */
export const revokeShare = (token) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.REVOKE_SHARE_REQUEST });

  try {
    await api.delete(`/api/shares/${token}`);

    dispatch({
      type: SHARES_ACTION_TYPES.REVOKE_SHARE_SUCCESS,
      payload: token,
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to revoke share";

    dispatch({
      type: SHARES_ACTION_TYPES.REVOKE_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch user's shares.
 * @param {boolean} activeOnly - If true, fetch only active shares
 */
export const fetchMyShares =
  (activeOnly = false) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.FETCH_MY_SHARES_REQUEST });

    try {
      const response = await api.get(
        `/api/shares/my-shares?activeOnly=${activeOnly}`,
      );

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_MY_SHARES_SUCCESS,
        payload: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shares";

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_MY_SHARES_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Fetch share statistics.
 */
export const fetchShareStats = () => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.FETCH_SHARE_STATS_REQUEST });

  try {
    const response = await api.get("/api/shares/stats");

    dispatch({
      type: SHARES_ACTION_TYPES.FETCH_SHARE_STATS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch share stats";

    dispatch({
      type: SHARES_ACTION_TYPES.FETCH_SHARE_STATS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Regenerate QR code for an existing share.
 * @param {string} token - Share token
 * @param {number} size - QR code size in pixels
 */
export const regenerateQr =
  (token, size = 300) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.REGENERATE_QR_REQUEST });

    try {
      const response = await api.post(
        `/api/shares/${token}/regenerate-qr?size=${size}`,
      );

      dispatch({
        type: SHARES_ACTION_TYPES.REGENERATE_QR_SUCCESS,
        payload: { token, ...response.data },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to regenerate QR code";

      dispatch({
        type: SHARES_ACTION_TYPES.REGENERATE_QR_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Clear share error.
 */
export const clearShareError = () => ({
  type: SHARES_ACTION_TYPES.CLEAR_SHARE_ERROR,
});

/**
 * Clear current share (after modal close).
 */
export const clearCurrentShare = () => ({
  type: SHARES_ACTION_TYPES.CLEAR_CURRENT_SHARE,
});

/**
 * Clear shared data view.
 */
export const clearSharedData = () => ({
  type: SHARES_ACTION_TYPES.CLEAR_SHARED_DATA,
});

/**
 * Share directly with a friend and notify them.
 * @param {string} token - Share token
 * @param {number} friendId - Friend's user ID
 * @param {string} message - Optional message to send with notification
 */
export const shareWithFriend =
  (token, friendId, message = "") =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_REQUEST });

    try {
      const response = await api.post(
        `/api/shares/${token}/share-with-friend`,
        {
          friendId,
          message,
        },
      );

      dispatch({
        type: SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_SUCCESS,
        payload: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to share with friend";

      dispatch({
        type: SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };
