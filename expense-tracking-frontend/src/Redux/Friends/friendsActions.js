import { api } from "../../config/api";
import axios from "axios";
import {
  FETCH_FRIEND_SUGGESTIONS_REQUEST,
  FETCH_FRIEND_SUGGESTIONS_SUCCESS,
  FETCH_FRIEND_SUGGESTIONS_FAILURE,
  SEND_FRIEND_REQUEST_REQUEST,
  SEND_FRIEND_REQUEST_SUCCESS,
  SEND_FRIEND_REQUEST_FAILURE,
  FETCH_FRIEND_REQUESTS_REQUEST,
  FETCH_FRIEND_REQUESTS_SUCCESS,
  FETCH_FRIEND_REQUESTS_FAILURE,
  RESPOND_TO_FRIEND_REQUEST_REQUEST,
  RESPOND_TO_FRIEND_REQUEST_SUCCESS,
  RESPOND_TO_FRIEND_REQUEST_FAILURE,
  ADD_NEW_FRIEND_REQUEST,
  REMOVE_FRIEND_REQUEST,
  FETCH_FRIENDS_REQUEST,
  FETCH_FRIENDS_SUCCESS,
  FETCH_FRIENDS_FAILURE,
  SET_ACCESS_LEVEL_REQUEST,
  SET_ACCESS_LEVEL_SUCCESS,
  SET_ACCESS_LEVEL_FAILURE,
  FETCH_I_SHARED_WITH_REQUEST,
  FETCH_I_SHARED_WITH_SUCCESS,
  FETCH_I_SHARED_WITH_FAILURE,
  FETCH_SHARED_WITH_ME_REQUEST,
  FETCH_SHARED_WITH_ME_SUCCESS,
  FETCH_SHARED_WITH_ME_FAILURE,
  FETCH_FRIENDS_EXPENSES_SUCCESS,
  FETCH_FRIENDS_EXPENSES_FAILURE,
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
  CANCEL_FRIEND_REQUEST_REQUEST,
  CANCEL_FRIEND_REQUEST_SUCCESS,
  CANCEL_FRIEND_REQUEST_FAILURE,
  REMOVE_FRIENDSHIP_REQUEST,
  REMOVE_FRIENDSHIP_SUCCESS,
  REMOVE_FRIENDSHIP_FAILURE,
  BLOCK_USER_REQUEST,
  BLOCK_USER_SUCCESS,
  BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST,
  UNBLOCK_USER_SUCCESS,
  UNBLOCK_USER_FAILURE,
  FETCH_BLOCKED_USERS_REQUEST,
  FETCH_BLOCKED_USERS_SUCCESS,
  FETCH_BLOCKED_USERS_FAILURE,
  FETCH_FRIENDSHIP_STATS_REQUEST,
  FETCH_FRIENDSHIP_STATS_SUCCESS,
  FETCH_FRIENDSHIP_STATS_FAILURE,
  FETCH_MUTUAL_FRIENDS_REQUEST,
  FETCH_MUTUAL_FRIENDS_SUCCESS,
  FETCH_MUTUAL_FRIENDS_FAILURE,
  SEARCH_FRIENDS_REQUEST,
  SEARCH_FRIENDS_SUCCESS,
  SEARCH_FRIENDS_FAILURE,
  FETCH_OUTGOING_REQUESTS_REQUEST,
  FETCH_OUTGOING_REQUESTS_SUCCESS,
  FETCH_OUTGOING_REQUESTS_FAILURE,
  FETCH_EXPENSE_SHARING_SUMMARY_REQUEST,
  FETCH_EXPENSE_SHARING_SUMMARY_SUCCESS,
  FETCH_EXPENSE_SHARING_SUMMARY_FAILURE,
  QUICK_SHARE_EXPENSES_REQUEST,
  QUICK_SHARE_EXPENSES_SUCCESS,
  QUICK_SHARE_EXPENSES_FAILURE,
  BATCH_SHARE_EXPENSES_REQUEST,
  BATCH_SHARE_EXPENSES_SUCCESS,
  BATCH_SHARE_EXPENSES_FAILURE,
  FETCH_RECOMMENDED_TO_SHARE_REQUEST,
  FETCH_RECOMMENDED_TO_SHARE_SUCCESS,
  FETCH_RECOMMENDED_TO_SHARE_FAILURE,
  FETCH_FRIENDSHIP_REPORT_REQUEST,
  FETCH_FRIENDSHIP_REPORT_SUCCESS,
  FETCH_FRIENDSHIP_REPORT_FAILURE,
  CLEAR_FRIENDSHIP_REPORT,
  CHECK_ARE_FRIENDS_REQUEST,
  CHECK_ARE_FRIENDS_SUCCESS,
  CHECK_ARE_FRIENDS_FAILURE,
  FETCH_FRIEND_IDS_REQUEST,
  FETCH_FRIEND_IDS_SUCCESS,
  FETCH_FRIEND_IDS_FAILURE,
  FETCH_ALL_PENDING_REQUESTS_REQUEST,
  FETCH_ALL_PENDING_REQUESTS_SUCCESS,
  FETCH_ALL_PENDING_REQUESTS_FAILURE,
  CHECK_FRIENDSHIP_STATUS_REQUEST,
  CHECK_FRIENDSHIP_STATUS_SUCCESS,
  CHECK_FRIENDSHIP_STATUS_FAILURE,
  CHECK_EXPENSE_ACCESS_REQUEST,
  CHECK_EXPENSE_ACCESS_SUCCESS,
  CHECK_EXPENSE_ACCESS_FAILURE,
  CHECK_CAN_ACCESS_EXPENSES_REQUEST,
  CHECK_CAN_ACCESS_EXPENSES_SUCCESS,
  CHECK_CAN_ACCESS_EXPENSES_FAILURE,
  CHECK_CAN_MODIFY_EXPENSES_REQUEST,
  CHECK_CAN_MODIFY_EXPENSES_SUCCESS,
  CHECK_CAN_MODIFY_EXPENSES_FAILURE,
  FETCH_USER_ACCESS_LEVEL_REQUEST,
  FETCH_USER_ACCESS_LEVEL_SUCCESS,
  FETCH_USER_ACCESS_LEVEL_FAILURE,
  FETCH_FRIENDSHIP_BY_ID_REQUEST,
  FETCH_FRIENDSHIP_BY_ID_SUCCESS,
  FETCH_FRIENDSHIP_BY_ID_FAILURE,
} from "./friendsActionTypes";

// Fetch friend suggestions
export const fetchFriendSuggestions = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_SUGGESTIONS_REQUEST });

  try {
    const response = await api.get("/api/friendships/suggestions");
    // console.log("Friend suggestions response:", response.data);

    dispatch({
      type: FETCH_FRIEND_SUGGESTIONS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend suggestions";

    dispatch({
      type: FETCH_FRIEND_SUGGESTIONS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Send friend request
export const sendFriendRequest = (recipientId) => async (dispatch) => {
  dispatch({ type: SEND_FRIEND_REQUEST_REQUEST });

  try {
    const response = await api.post(
      `/api/friendships/request?recipientId=${recipientId}`
    );
    console.log("Send friend request response:", response.data);

    dispatch({
      type: SEND_FRIEND_REQUEST_SUCCESS,
      payload: {
        friendship: response.data,
        recipientId: recipientId,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error sending friend request:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to send friend request";

    dispatch({
      type: SEND_FRIEND_REQUEST_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch incoming friend requests
export const fetchFriendRequests = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_REQUESTS_REQUEST });

  try {
    const response = await api.get("/api/friendships/pending/incoming");
    // console.log("Friend requests response:", response.data);

    dispatch({
      type: FETCH_FRIEND_REQUESTS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend requests";

    dispatch({
      type: FETCH_FRIEND_REQUESTS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch user's friends
export const fetchFriends = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDS_REQUEST });

  try {
    const response = await api.get("/api/friendships/friends");
    // console.log("Friends response:", response.data);

    dispatch({
      type: FETCH_FRIENDS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friends:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friends";

    dispatch({
      type: FETCH_FRIENDS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Respond to friend request (accept/reject)
export const respondToFriendRequest =
  (friendshipId, accept) => async (dispatch) => {
    dispatch({ type: RESPOND_TO_FRIEND_REQUEST_REQUEST });

    try {
      // The accept parameter is already a boolean, so we don't need to convert it
      const response = await api.put(
        `/api/friendships/${friendshipId}/respond?accept=${accept}`
      );
      // console.log(
      //   `${accept ? "Accept" : "Reject"} friend request response:`,
      //   response.data
      // );

      dispatch({
        type: RESPOND_TO_FRIEND_REQUEST_SUCCESS,
        payload: {
          friendshipId,
          accept,
          response: response.data,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        `Error ${accept ? "accepting" : "rejecting"} friend request:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${accept ? "accept" : "reject"} friend request`;

      dispatch({
        type: RESPOND_TO_FRIEND_REQUEST_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// Add this new action
export const addNewFriendRequest = (friendship) => (dispatch) => {
  dispatch({
    type: ADD_NEW_FRIEND_REQUEST,
    payload: friendship,
  });
};

// Remove friend request from Redux store
export const removeFriendRequest = (friendshipId) => (dispatch) => {
  dispatch({
    type: REMOVE_FRIEND_REQUEST,
    payload: friendshipId,
  });
};

// Set access level for a friendship
export const setAccessLevel =
  (friendshipId, accessLevel) => async (dispatch) => {
    dispatch({ type: SET_ACCESS_LEVEL_REQUEST });

    try {
      const response = await api.put(
        `/api/friendships/${friendshipId}/access?accessLevel=${accessLevel}`
      );
      // console.log("Set access level response:", response.data);

      dispatch({
        type: SET_ACCESS_LEVEL_SUCCESS,
        payload: {
          friendship: response.data,
          friendshipId: friendshipId,
          accessLevel: accessLevel,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error setting access level:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to set access level";

      dispatch({
        type: SET_ACCESS_LEVEL_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// Fetch users I've shared expenses with
export const fetchISharedWith = () => async (dispatch) => {
  dispatch({ type: FETCH_I_SHARED_WITH_REQUEST });

  try {
    const response = await api.get("/api/friendships/i-shared-with");
    // console.log("I shared with response:", response.data);

    dispatch({
      type: FETCH_I_SHARED_WITH_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching users I shared with:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch users you've shared with";

    dispatch({
      type: FETCH_I_SHARED_WITH_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch users who have shared expenses with me
export const fetchSharedWithMe = () => async (dispatch) => {
  dispatch({ type: FETCH_SHARED_WITH_ME_REQUEST });

  try {
    const response = await api.get("/api/friendships/shared-with-me");
    // console.log("Shared with me response:", response.data);

    dispatch({
      type: FETCH_SHARED_WITH_ME_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching users who shared with me:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch users who shared with you";

    dispatch({
      type: FETCH_SHARED_WITH_ME_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch friends' expenses
export const fetchFriendsExpenses = (userId) => async (dispatch) => {
  try {
    const response = await api.get(`api/expenses/user/${userId}`);

    dispatch({
      type: FETCH_FRIENDS_EXPENSES_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDS_EXPENSES_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchFriendship = (friendId) => async (dispatch) => {
  try {
    const response = await api.get(`/api/friendships/details`, {
      params: {
        friendId: friendId,
      },
    });

    dispatch({
      type: FETCH_FRIENDSHIP_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDSHIP_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchFriendsDetailed = () => async (dispatch) => {
  try {
    const response = await api.get("/api/friendships/friends/detailed");
    dispatch({
      type: FETCH_FRIENDS_SUCCESS, // Ensure this matches the constant
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDS_FAILURE, // Ensure this matches the constant
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Cancel friend request
export const cancelFriendRequest = (friendshipId) => async (dispatch) => {
  dispatch({ type: CANCEL_FRIEND_REQUEST_REQUEST });

  try {
    const response = await api.delete(
      `/api/friendships/request/${friendshipId}/cancel`
    );

    dispatch({
      type: CANCEL_FRIEND_REQUEST_SUCCESS,
      payload: friendshipId,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to cancel friend request";

    dispatch({
      type: CANCEL_FRIEND_REQUEST_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Remove friendship
export const removeFriendship = (friendshipId) => async (dispatch) => {
  dispatch({ type: REMOVE_FRIENDSHIP_REQUEST });

  try {
    const response = await api.delete(`/api/friendships/${friendshipId}`);

    dispatch({
      type: REMOVE_FRIENDSHIP_SUCCESS,
      payload: friendshipId,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error removing friendship:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to remove friendship";

    dispatch({
      type: REMOVE_FRIENDSHIP_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Block user
export const blockUser = (userId) => async (dispatch) => {
  dispatch({ type: BLOCK_USER_REQUEST });

  try {
    const response = await api.post(`/api/friendships/block/${userId}`);

    dispatch({
      type: BLOCK_USER_SUCCESS,
      payload: userId,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error blocking user:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to block user";

    dispatch({
      type: BLOCK_USER_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Unblock user
export const unblockUser = (userId) => async (dispatch) => {
  dispatch({ type: UNBLOCK_USER_REQUEST });

  try {
    const response = await api.post(`/api/friendships/unblock/${userId}`);

    dispatch({
      type: UNBLOCK_USER_SUCCESS,
      payload: userId,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error unblocking user:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to unblock user";

    dispatch({
      type: UNBLOCK_USER_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get blocked users
export const fetchBlockedUsers = () => async (dispatch) => {
  dispatch({ type: FETCH_BLOCKED_USERS_REQUEST });

  try {
    const response = await api.get("/api/friendships/blocked");

    dispatch({
      type: FETCH_BLOCKED_USERS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch blocked users";

    dispatch({
      type: FETCH_BLOCKED_USERS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get friendship stats
export const fetchFriendshipStats = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDSHIP_STATS_REQUEST });

  try {
    const response = await api.get("/api/friendships/stats");

    dispatch({
      type: FETCH_FRIENDSHIP_STATS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friendship stats:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friendship stats";

    dispatch({
      type: FETCH_FRIENDSHIP_STATS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get mutual friends
export const fetchMutualFriends = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_MUTUAL_FRIENDS_REQUEST });

  try {
    const response = await api.get(`/api/friendships/mutual/${userId}`);

    dispatch({
      type: FETCH_MUTUAL_FRIENDS_SUCCESS,
      payload: { userId, mutualFriends: response.data },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching mutual friends:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch mutual friends";

    dispatch({
      type: FETCH_MUTUAL_FRIENDS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Search friends
export const searchFriends = (query) => async (dispatch) => {
  dispatch({ type: SEARCH_FRIENDS_REQUEST });

  try {
    const response = await api.get(`/api/friendships/search?query=${query}`);

    dispatch({
      type: SEARCH_FRIENDS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error searching friends:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to search friends";

    dispatch({
      type: SEARCH_FRIENDS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get outgoing requests
export const fetchOutgoingRequests = () => async (dispatch) => {
  dispatch({ type: FETCH_OUTGOING_REQUESTS_REQUEST });

  try {
    const response = await api.get("/api/friendships/pending/outgoing");

    dispatch({
      type: FETCH_OUTGOING_REQUESTS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching outgoing requests:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch outgoing requests";

    dispatch({
      type: FETCH_OUTGOING_REQUESTS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get expense sharing summary
export const fetchExpenseSharingSummary = () => async (dispatch) => {
  dispatch({ type: FETCH_EXPENSE_SHARING_SUMMARY_REQUEST });

  try {
    const response = await api.get("/api/friendships/expense-sharing-summary");

    dispatch({
      type: FETCH_EXPENSE_SHARING_SUMMARY_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching expense sharing summary:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch expense sharing summary";

    dispatch({
      type: FETCH_EXPENSE_SHARING_SUMMARY_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Quick share expenses
export const quickShareExpenses = (userId, accessLevel) => async (dispatch) => {
  dispatch({ type: QUICK_SHARE_EXPENSES_REQUEST });

  try {
    const response = await api.put(
      `/api/friendships/quick-share/${userId}?accessLevel=${accessLevel}`
    );

    dispatch({
      type: QUICK_SHARE_EXPENSES_SUCCESS,
      payload: { userId, accessLevel, response: response.data },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error quick sharing expenses:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to share expenses";

    dispatch({
      type: QUICK_SHARE_EXPENSES_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Batch share expenses
export const batchShareExpenses = (requests) => async (dispatch) => {
  dispatch({ type: BATCH_SHARE_EXPENSES_REQUEST });

  try {
    const response = await api.post("/api/friendships/batch-share", requests);

    dispatch({
      type: BATCH_SHARE_EXPENSES_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error batch sharing expenses:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to batch share expenses";

    dispatch({
      type: BATCH_SHARE_EXPENSES_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Get recommended to share
export const fetchRecommendedToShare = () => async (dispatch) => {
  dispatch({ type: FETCH_RECOMMENDED_TO_SHARE_REQUEST });

  try {
    const response = await api.get("/api/friendships/recommended-to-share");

    dispatch({
      type: FETCH_RECOMMENDED_TO_SHARE_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching recommended to share:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch recommendations";

    dispatch({
      type: FETCH_RECOMMENDED_TO_SHARE_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch friendship report with filtering and sorting
 * @param {Object} filters - Filter options
 * @param {Date} filters.fromDate - Start date filter
 * @param {Date} filters.toDate - End date filter
 * @param {string} filters.status - Status filter (PENDING, ACCEPTED, REJECTED)
 * @param {string} filters.accessLevel - Access level filter (NONE, READ, WRITE, FULL)
 * @param {string} filters.sortBy - Sort field (createdAt, updatedAt, status)
 * @param {string} filters.sortDirection - Sort direction (asc, desc)
 * @param {number} filters.page - Page number
 * @param {number} filters.size - Page size
 */
export const fetchFriendshipReport =
  (filters = {}) =>
  async (dispatch) => {
    dispatch({ type: FETCH_FRIENDSHIP_REPORT_REQUEST });

    try {
      const params = new URLSearchParams();

      if (filters.fromDate) {
        params.append("fromDate", filters.fromDate.toISOString());
      }
      if (filters.toDate) {
        params.append("toDate", filters.toDate.toISOString());
      }
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.accessLevel && filters.accessLevel !== "all") {
        params.append("accessLevel", filters.accessLevel);
      }
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      if (filters.sortDirection) {
        params.append("sortDirection", filters.sortDirection);
      }
      if (filters.page !== undefined) {
        params.append("page", filters.page);
      }
      if (filters.size !== undefined) {
        params.append("size", filters.size);
      }

      const queryString = params.toString();
      const url = `/api/friendships/report${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);

      dispatch({
        type: FETCH_FRIENDSHIP_REPORT_SUCCESS,
        payload: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching friendship report:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch friendship report";

      dispatch({
        type: FETCH_FRIENDSHIP_REPORT_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// Clear friendship report
export const clearFriendshipReport = () => ({
  type: CLEAR_FRIENDSHIP_REPORT,
});

// Check if two users are friends (requester derived from JWT)
export const checkAreFriends = (otherUserId) => async (dispatch) => {
  dispatch({ type: CHECK_ARE_FRIENDS_REQUEST });
  try {
    const response = await api.get(`/api/friendships/are-friends/${otherUserId}`);
    dispatch({ type: CHECK_ARE_FRIENDS_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to check if friends";
    dispatch({ type: CHECK_ARE_FRIENDS_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Fetch friend IDs for the authenticated user
export const fetchFriendIds = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_IDS_REQUEST });
  try {
    const response = await api.get("/api/friendships/friend-ids");
    dispatch({ type: FETCH_FRIEND_IDS_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch friend IDs";
    dispatch({ type: FETCH_FRIEND_IDS_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Fetch all pending requests (incoming and outgoing)
export const fetchAllPendingRequests = () => async (dispatch) => {
  dispatch({ type: FETCH_ALL_PENDING_REQUESTS_REQUEST });
  try {
    const response = await api.get("/api/friendships/pending");
    dispatch({ type: FETCH_ALL_PENDING_REQUESTS_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch pending requests";
    dispatch({ type: FETCH_ALL_PENDING_REQUESTS_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Check friendship status with a specific user
export const checkFriendshipStatus = (userId) => async (dispatch) => {
  dispatch({ type: CHECK_FRIENDSHIP_STATUS_REQUEST });
  try {
    const response = await api.get(`/api/friendships/check/${userId}`);
    dispatch({ type: CHECK_FRIENDSHIP_STATUS_SUCCESS, payload: { userId, data: response.data } });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to check friendship status";
    dispatch({ type: CHECK_FRIENDSHIP_STATUS_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Check expense access for a specific user
export const checkExpenseAccess = (userId) => async (dispatch) => {
  dispatch({ type: CHECK_EXPENSE_ACCESS_REQUEST });
  try {
    const response = await api.get(`/api/friendships/access-check/${userId}`);
    dispatch({ type: CHECK_EXPENSE_ACCESS_SUCCESS, payload: { userId, data: response.data } });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to check expense access";
    dispatch({ type: CHECK_EXPENSE_ACCESS_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Check if user can access expenses (requester derived from JWT)
export const checkCanAccessExpenses = (targetUserId) => async (dispatch) => {
  dispatch({ type: CHECK_CAN_ACCESS_EXPENSES_REQUEST });
  try {
    const response = await api.get(`/api/friendships/can-access-expenses?targetUserId=${targetUserId}`);
    dispatch({ type: CHECK_CAN_ACCESS_EXPENSES_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to check if can access expenses";
    dispatch({ type: CHECK_CAN_ACCESS_EXPENSES_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Check if user can modify expenses (requester derived from JWT)
export const checkCanModifyExpenses = (targetUserId) => async (dispatch) => {
  dispatch({ type: CHECK_CAN_MODIFY_EXPENSES_REQUEST });
  try {
    const response = await api.get(`/api/friendships/can-modify-expenses?targetUserId=${targetUserId}`);
    dispatch({ type: CHECK_CAN_MODIFY_EXPENSES_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to check if can modify expenses";
    dispatch({ type: CHECK_CAN_MODIFY_EXPENSES_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Fetch user access level (viewer derived from JWT)
export const fetchUserAccessLevel = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_ACCESS_LEVEL_REQUEST });
  try {
    const response = await api.get(`/api/friendships/get-access-level?userId=${userId}`);
    dispatch({ type: FETCH_USER_ACCESS_LEVEL_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user access level";
    dispatch({ type: FETCH_USER_ACCESS_LEVEL_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Fetch friendship by ID
export const fetchFriendshipById = (friendshipId) => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDSHIP_BY_ID_REQUEST });
  try {
    const response = await api.get(`/api/friendships/${friendshipId}`);
    dispatch({ type: FETCH_FRIENDSHIP_BY_ID_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch friendship by ID";
    dispatch({ type: FETCH_FRIENDSHIP_BY_ID_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};
