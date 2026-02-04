/**
 * Friend Activity Actions
 * Redux actions for fetching and managing friend activity data.
 */

import { api } from "../../config/api";
import {
  FETCH_FRIEND_ACTIVITIES_REQUEST,
  FETCH_FRIEND_ACTIVITIES_SUCCESS,
  FETCH_FRIEND_ACTIVITIES_FAILURE,
  FETCH_FRIEND_ACTIVITIES_PAGED_REQUEST,
  FETCH_FRIEND_ACTIVITIES_PAGED_SUCCESS,
  FETCH_FRIEND_ACTIVITIES_PAGED_FAILURE,
  FETCH_UNREAD_ACTIVITIES_REQUEST,
  FETCH_UNREAD_ACTIVITIES_SUCCESS,
  FETCH_UNREAD_ACTIVITIES_FAILURE,
  FETCH_UNREAD_COUNT_REQUEST,
  FETCH_UNREAD_COUNT_SUCCESS,
  FETCH_UNREAD_COUNT_FAILURE,
  FETCH_ACTIVITIES_BY_SERVICE_REQUEST,
  FETCH_ACTIVITIES_BY_SERVICE_SUCCESS,
  FETCH_ACTIVITIES_BY_SERVICE_FAILURE,
  FETCH_ACTIVITIES_BY_FRIEND_REQUEST,
  FETCH_ACTIVITIES_BY_FRIEND_SUCCESS,
  FETCH_ACTIVITIES_BY_FRIEND_FAILURE,
  FETCH_RECENT_ACTIVITIES_REQUEST,
  FETCH_RECENT_ACTIVITIES_SUCCESS,
  FETCH_RECENT_ACTIVITIES_FAILURE,
  MARK_ACTIVITY_READ_REQUEST,
  MARK_ACTIVITY_READ_SUCCESS,
  MARK_ACTIVITY_READ_FAILURE,
  MARK_ALL_ACTIVITIES_READ_REQUEST,
  MARK_ALL_ACTIVITIES_READ_SUCCESS,
  MARK_ALL_ACTIVITIES_READ_FAILURE,
  FETCH_ACTIVITY_SUMMARY_REQUEST,
  FETCH_ACTIVITY_SUMMARY_SUCCESS,
  FETCH_ACTIVITY_SUMMARY_FAILURE,
  CLEAR_FRIEND_ACTIVITIES,
  SET_ACTIVITY_FILTERS,
  RESET_ACTIVITY_FILTERS,
} from "./friendActivity.actionTypes";

const API_BASE = "/api/activities";

/**
 * Fetch all activities for the authenticated user.
 */
export const fetchFriendActivities = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_ACTIVITIES_REQUEST });

  try {
    const response = await api.get(API_BASE);
    dispatch({
      type: FETCH_FRIEND_ACTIVITIES_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend activities";
    dispatch({
      type: FETCH_FRIEND_ACTIVITIES_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch paginated activities.
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 */
export const fetchFriendActivitiesPaged =
  (page = 0, size = 20) =>
  async (dispatch) => {
    dispatch({ type: FETCH_FRIEND_ACTIVITIES_PAGED_REQUEST });

    try {
      const response = await api.get(`${API_BASE}/paged`, {
        params: { page, size },
      });
      dispatch({
        type: FETCH_FRIEND_ACTIVITIES_PAGED_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch paginated activities";
      dispatch({
        type: FETCH_FRIEND_ACTIVITIES_PAGED_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

/**
 * Fetch unread activities for the authenticated user.
 */
export const fetchUnreadActivities = () => async (dispatch) => {
  dispatch({ type: FETCH_UNREAD_ACTIVITIES_REQUEST });

  try {
    const response = await api.get(`${API_BASE}/unread`);
    dispatch({
      type: FETCH_UNREAD_ACTIVITIES_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch unread activities";
    dispatch({
      type: FETCH_UNREAD_ACTIVITIES_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch unread activity count.
 */
export const fetchUnreadCount = () => async (dispatch) => {
  dispatch({ type: FETCH_UNREAD_COUNT_REQUEST });

  try {
    const response = await api.get(`${API_BASE}/unread/count`);
    dispatch({
      type: FETCH_UNREAD_COUNT_SUCCESS,
      payload: response.data.count,
    });
    return { success: true, count: response.data.count };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch unread count";
    dispatch({
      type: FETCH_UNREAD_COUNT_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch activities by service type.
 * @param {string} service - Service name (EXPENSE, BILL, BUDGET, CATEGORY, PAYMENT)
 */
export const fetchActivitiesByService = (service) => async (dispatch) => {
  dispatch({ type: FETCH_ACTIVITIES_BY_SERVICE_REQUEST, payload: service });

  try {
    const response = await api.get(`${API_BASE}/service/${service}`);
    dispatch({
      type: FETCH_ACTIVITIES_BY_SERVICE_SUCCESS,
      payload: { service, data: response.data },
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      `Failed to fetch ${service} activities`;
    dispatch({
      type: FETCH_ACTIVITIES_BY_SERVICE_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch activities by a specific friend.
 * @param {number} friendId - Friend's user ID
 */
export const fetchActivitiesByFriend = (friendId) => async (dispatch) => {
  dispatch({ type: FETCH_ACTIVITIES_BY_FRIEND_REQUEST, payload: friendId });

  try {
    const response = await api.get(`${API_BASE}/friend/${friendId}`);
    dispatch({
      type: FETCH_ACTIVITIES_BY_FRIEND_SUCCESS,
      payload: { friendId, data: response.data },
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend activities";
    dispatch({
      type: FETCH_ACTIVITIES_BY_FRIEND_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch recent activities (last N days).
 * @param {number} days - Number of days to look back
 */
export const fetchRecentActivities =
  (days = 7) =>
  async (dispatch) => {
    dispatch({ type: FETCH_RECENT_ACTIVITIES_REQUEST });

    try {
      const response = await api.get(`${API_BASE}/recent`, {
        params: { days },
      });
      dispatch({
        type: FETCH_RECENT_ACTIVITIES_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch recent activities";
      dispatch({
        type: FETCH_RECENT_ACTIVITIES_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

/**
 * Mark a specific activity as read.
 * @param {number} activityId - Activity ID to mark as read
 */
export const markActivityAsRead = (activityId) => async (dispatch) => {
  dispatch({ type: MARK_ACTIVITY_READ_REQUEST, payload: activityId });

  try {
    await api.put(`${API_BASE}/${activityId}/read`);
    dispatch({
      type: MARK_ACTIVITY_READ_SUCCESS,
      payload: activityId,
    });
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to mark activity as read";
    dispatch({
      type: MARK_ACTIVITY_READ_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Mark all activities as read.
 */
export const markAllActivitiesAsRead = () => async (dispatch) => {
  dispatch({ type: MARK_ALL_ACTIVITIES_READ_REQUEST });

  try {
    const response = await api.put(`${API_BASE}/read-all`);
    dispatch({
      type: MARK_ALL_ACTIVITIES_READ_SUCCESS,
      payload: response.data.count,
    });
    return { success: true, count: response.data.count };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to mark all activities as read";
    dispatch({
      type: MARK_ALL_ACTIVITIES_READ_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch activity summary.
 */
export const fetchActivitySummary = () => async (dispatch) => {
  dispatch({ type: FETCH_ACTIVITY_SUMMARY_REQUEST });

  try {
    const response = await api.get(`${API_BASE}/summary`);
    dispatch({
      type: FETCH_ACTIVITY_SUMMARY_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch activity summary";
    dispatch({
      type: FETCH_ACTIVITY_SUMMARY_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Clear friend activities state.
 */
export const clearFriendActivities = () => ({
  type: CLEAR_FRIEND_ACTIVITIES,
});

/**
 * Set activity filters.
 * @param {Object} filters - Filter configuration object
 */
export const setActivityFilters = (filters) => ({
  type: SET_ACTIVITY_FILTERS,
  payload: filters,
});

/**
 * Reset all activity filters.
 */
export const resetActivityFilters = () => ({
  type: RESET_ACTIVITY_FILTERS,
});
