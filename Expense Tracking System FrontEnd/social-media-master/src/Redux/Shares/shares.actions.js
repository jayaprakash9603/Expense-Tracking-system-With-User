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

// ========== Paginated Access Actions ==========

/**
 * Access shared data with pagination support.
 * @param {string} token - Share token
 * @param {string} resourceType - Type of resource (EXPENSE, CATEGORY, BUDGET, BILL, PAYMENT_METHOD, or ALL for overview)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @param {string} search - Optional search query
 */
export const accessSharePaginated =
  (token, resourceType = "ALL", page = 0, size = 50, search = "") =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_REQUEST });

    try {
      const jwt = localStorage.getItem("jwt");
      const config = jwt ? {} : { skipAuth: true };

      let url = `/api/shares/${token}/paginated?type=${resourceType}&page=${page}&size=${size}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await api.get(url, config);

      dispatch({
        type: SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_SUCCESS,
        payload: {
          ...response.data,
          token,
          resourceType,
          page,
          search: search || "",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.invalidReason ||
        error.response?.data?.message ||
        error.message ||
        "Failed to access share";

      dispatch({
        type: SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Load more items for current resource type (append to existing).
 * @param {string} token - Share token
 * @param {string} resourceType - Type of resource
 * @param {number} page - Next page number
 * @param {number} size - Page size
 * @param {string} search - Optional search query
 */
export const loadMoreSharedItems =
  (token, resourceType, page, size = 50, search = "") =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_REQUEST });

    try {
      const jwt = localStorage.getItem("jwt");
      const config = jwt ? {} : { skipAuth: true };

      let url = `/api/shares/${token}/paginated?type=${resourceType}&page=${page}&size=${size}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await api.get(url, config);

      dispatch({
        type: SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_SUCCESS,
        payload: {
          ...response.data,
          resourceType,
          page,
          search: search || "",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load more items";

      dispatch({
        type: SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Set the active resource tab.
 * @param {string} resourceType - Type of resource tab to set active
 */
export const setActiveResourceTab = (resourceType) => ({
  type: SHARES_ACTION_TYPES.SET_ACTIVE_RESOURCE_TAB,
  payload: resourceType,
});

// ========== User Added Items Tracking Actions ==========

/**
 * Fetch items that the user has already added from a share.
 * @param {string} token - Share token
 */
export const fetchAddedItems = (token) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_REQUEST });

  try {
    const response = await api.get(`/api/shares/${token}/added-items`);

    dispatch({
      type: SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_SUCCESS,
      payload: {
        token,
        ...response.data,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch added items";

    dispatch({
      type: SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Track that a user has added an item from a share.
 * @param {string} token - Share token
 * @param {Object} itemData - { externalRef, resourceType, originalOwnerId, newItemId }
 */
export const trackAddedItem = (token, itemData) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_REQUEST });

  try {
    const response = await api.post(
      `/api/shares/${token}/added-items`,
      itemData,
    );

    dispatch({
      type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_SUCCESS,
      payload: {
        token,
        externalRef: itemData.externalRef,
        ...response.data,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to track added item";

    dispatch({
      type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Track multiple items at once.
 * @param {string} token - Share token
 * @param {Array} items - Array of { externalRef, resourceType, originalOwnerId, newItemId }
 */
export const trackAddedItemsBulk = (token, items) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_REQUEST });

  try {
    const response = await api.post(`/api/shares/${token}/added-items/bulk`, {
      items,
    });

    dispatch({
      type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_SUCCESS,
      payload: {
        token,
        items: items.map((i) => i.externalRef),
        ...response.data,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to track added items";

    dispatch({
      type: SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Untrack an item (allow re-adding later).
 * @param {string} token - Share token
 * @param {string} externalRef - External reference of the item
 */
export const untrackItem = (token, externalRef) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.UNTRACK_ITEM_REQUEST });

  try {
    await api.delete(`/api/shares/${token}/added-items/${externalRef}`);

    dispatch({
      type: SHARES_ACTION_TYPES.UNTRACK_ITEM_SUCCESS,
      payload: {
        token,
        externalRef,
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to untrack item";

    dispatch({
      type: SHARES_ACTION_TYPES.UNTRACK_ITEM_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};
