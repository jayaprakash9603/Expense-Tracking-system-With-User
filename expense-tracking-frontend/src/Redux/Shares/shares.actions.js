import { api } from "../../config/api";
import { SHARES_ACTION_TYPES } from "./shares.actionTypes";

const getShareBaseUrlHeaders = () => {
  if (typeof window === "undefined") return {};
  const origin = window.location?.origin;
  if (!origin) return {};
  return { "X-Share-Base-Url": origin };
};

/**
 * Create a new share with QR code generation.
 * @param {Object} shareData - { resourceType, resourceRefs, permission, expiryDays, customExpiry, shareName }
 */
export const createShare = (shareData) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.CREATE_SHARE_REQUEST });

  try {
    const response = await api.post("/api/shares", shareData, {
      headers: getShareBaseUrlHeaders(),
    });

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
 * Regenerate QR code for an existing share (owner only).
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
        null,
        {
          headers: getShareBaseUrlHeaders(),
        },
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
 * Get QR code for any valid share (including public shares).
 * Unlike regenerateQr, this doesn't require ownership.
 * @param {string} token - Share token
 * @param {number} size - QR code size in pixels
 */
export const getShareQr =
  (token, size = 300) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.REGENERATE_QR_REQUEST });

    try {
      const response = await api.get(`/api/shares/${token}/qr?size=${size}`, {
        headers: getShareBaseUrlHeaders(),
      });

      dispatch({
        type: SHARES_ACTION_TYPES.REGENERATE_QR_SUCCESS,
        payload: { token, ...response.data },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get QR code";

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
        {
          headers: getShareBaseUrlHeaders(),
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

// ========== Public Shares Actions ==========

/**
 * Fetch all public shares visible to all users.
 * NOTE: This endpoint may not exist yet - returns empty array as fallback.
 * @param {Object} options - { page, size, search, resourceType }
 */
export const fetchPublicShares =
  (options = {}) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.FETCH_PUBLIC_SHARES_REQUEST });

    try {
      const { page = 0, size = 50, search = "", resourceType = "" } = options;
      let url = `/api/shares/public?page=${page}&size=${size}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (resourceType) url += `&resourceType=${resourceType}`;

      const response = await api.get(url);

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_PUBLIC_SHARES_SUCCESS,
        payload: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      // If endpoint doesn't exist, return empty data instead of error
      if (error.response?.status === 404 || error.response?.status === 500) {
        dispatch({
          type: SHARES_ACTION_TYPES.FETCH_PUBLIC_SHARES_SUCCESS,
          payload: { shares: [], message: "Public shares feature coming soon" },
        });
        return { success: true, data: { shares: [] } };
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch public shares";

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_PUBLIC_SHARES_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// ========== Shared With Me Actions ==========

/**
 * Fetch QR-code based shares that have been shared with the current user.
 * Uses the shares endpoint /api/shares/shared-with-me
 * @param {Object} options - { savedOnly }
 */
export const fetchSharedWithMe =
  (options = {}) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.FETCH_SHARED_WITH_ME_REQUEST });

    try {
      const { savedOnly = false } = options;
      const response = await api.get(
        `/api/shares/shared-with-me?savedOnly=${savedOnly}`,
      );

      // Response is already in the correct format from backend
      // SharedWithMeItem: { shareId, token, shareUrl, resourceType, permission, shareName,
      //                     resourceCount, expiresAt, isActive, firstAccessedAt, lastAccessedAt,
      //                     myAccessCount, isSaved, owner: { id, firstName, lastName, username, email, profileImage } }
      const shares = response.data || [];

      // Map to frontend expected format
      const transformedShares = shares.map((item) => ({
        id: item.shareId,
        token: item.token,
        shareUrl: item.shareUrl,
        shareName: item.shareName,
        resourceType: item.resourceType,
        permission: item.permission,
        resourceCount: item.resourceCount,
        expiresAt: item.expiresAt,
        isActive: item.isActive,
        firstAccessedAt: item.firstAccessedAt,
        lastAccessedAt: item.lastAccessedAt,
        accessCount: item.myAccessCount,
        isSaved: item.isSaved,
        status: item.status,
        owner: item.owner
          ? {
              id: item.owner.id,
              firstName: item.owner.firstName,
              lastName: item.owner.lastName,
              username: item.owner.username,
              email: item.owner.email,
              profileImage: item.owner.profileImage,
            }
          : null,
        // For compatibility with old code
        accessLevel: item.permission === "EDIT" ? "WRITE" : "READ",
        canModify: item.permission === "EDIT",
      }));

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_SHARED_WITH_ME_SUCCESS,
        payload: { shares: transformedShares },
      });

      return { success: true, data: transformedShares };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shared with me";

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_SHARED_WITH_ME_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Fetch friend expense access shared with the current user.
 * Uses the friendship endpoint /api/friends/shared-with-me for direct friend sharing.
 * @param {Object} options - { page, size, search }
 */
export const fetchFriendSharedWithMe =
  (options = {}) =>
  async (dispatch) => {
    dispatch({ type: SHARES_ACTION_TYPES.FETCH_FRIEND_SHARED_WITH_ME_REQUEST });

    try {
      const response = await api.get(`/api/friends/shared-with-me`);

      // Transform friendship shared data to share-like format
      const sharedData = response.data || [];
      const transformedShares = sharedData.map((item, index) => ({
        id: item.userId || index,
        shareName: `${item.name}'s Expenses`,
        resourceType: "EXPENSE",
        permission: item.canModify ? "EDIT" : "VIEW",
        isActive: true,
        owner: {
          id: item.userId,
          firstName: item.name?.split(" ")[0] || "",
          lastName: item.name?.split(" ").slice(1).join(" ") || "",
          username: item.username,
          email: item.email,
          profileImage: item.profileImage || item.image,
        },
        accessLevel: item.accessLevel,
        canModify: item.canModify,
        // For friend expense sharing, we don't have tokens or expiry
        token: null,
        expiresAt: null,
        accessCount: 0,
        resourceCount: 0,
      }));

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_FRIEND_SHARED_WITH_ME_SUCCESS,
        payload: { shares: transformedShares },
      });

      return { success: true, data: transformedShares };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch friend shared with me";

      dispatch({
        type: SHARES_ACTION_TYPES.FETCH_FRIEND_SHARED_WITH_ME_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Toggle save/bookmark status for a share.
 * @param {string} token - Share token
 */
export const toggleSaveShare = (token) => async (dispatch) => {
  dispatch({ type: SHARES_ACTION_TYPES.TOGGLE_SAVE_SHARE_REQUEST });

  try {
    const response = await api.post(`/api/shares/${token}/toggle-save`);

    dispatch({
      type: SHARES_ACTION_TYPES.TOGGLE_SAVE_SHARE_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to toggle save status";

    dispatch({
      type: SHARES_ACTION_TYPES.TOGGLE_SAVE_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};
