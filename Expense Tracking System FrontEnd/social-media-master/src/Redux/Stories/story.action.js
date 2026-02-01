/**
 * Story Redux Actions
 * API calls and state mutations for Stories feature
 */
import { api } from "../../config/api";
import { STORY_ACTION_TYPES } from "./story.actionTypes";

// Base URL for story service
const STORY_API_BASE = "/api/stories";

/**
 * Fetch active stories for the current user
 */
export const fetchStories = (userId) => async (dispatch) => {
  dispatch({ type: STORY_ACTION_TYPES.FETCH_STORIES_REQUEST });

  try {
    const { data } = await api.get(`${STORY_API_BASE}?userId=${userId}`);

    dispatch({
      type: STORY_ACTION_TYPES.FETCH_STORIES_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch stories";

    dispatch({
      type: STORY_ACTION_TYPES.FETCH_STORIES_FAILURE,
      payload: errorMessage,
    });

    console.error("Fetch stories error:", error);
    throw error;
  }
};

/**
 * Mark a story as seen
 */
export const markStorySeen = (storyId, userId) => async (dispatch) => {
  try {
    await api.post(`${STORY_API_BASE}/${storyId}/seen?userId=${userId}`);

    dispatch({
      type: STORY_ACTION_TYPES.MARK_STORY_SEEN,
      payload: { storyId },
    });
  } catch (error) {
    console.error("Mark story seen error:", error);
    // Non-critical, don't throw
  }
};

/**
 * Mark CTA as clicked
 */
export const markCtaClicked = (storyId, ctaId, userId) => async (dispatch) => {
  try {
    await api.post(
      `${STORY_API_BASE}/${storyId}/cta/${ctaId}/clicked?userId=${userId}`,
    );

    dispatch({
      type: STORY_ACTION_TYPES.MARK_CTA_CLICKED,
      payload: { storyId, ctaId },
    });
  } catch (error) {
    console.error("Mark CTA clicked error:", error);
    // Non-critical, don't throw
  }
};

/**
 * Dismiss a story
 */
export const dismissStory = (storyId, userId) => async (dispatch) => {
  try {
    await api.post(`${STORY_API_BASE}/${storyId}/dismiss?userId=${userId}`);

    dispatch({
      type: STORY_ACTION_TYPES.DISMISS_STORY,
      payload: { storyId },
    });
  } catch (error) {
    console.error("Dismiss story error:", error);
    throw error;
  }
};

/**
 * WebSocket event handlers
 */
export const storyReceived = (story) => ({
  type: STORY_ACTION_TYPES.STORY_RECEIVED,
  payload: story,
});

export const storyUpdated = (story) => ({
  type: STORY_ACTION_TYPES.STORY_UPDATED,
  payload: story,
});

export const storyDeleted = (storyId) => ({
  type: STORY_ACTION_TYPES.STORY_DELETED,
  payload: { storyId },
});

/**
 * Trigger a refresh of all stories (called from WebSocket REFRESH_STORIES event)
 */
export const refreshStories = () => ({
  type: STORY_ACTION_TYPES.REFRESH_STORIES,
});

/**
 * Viewing state actions
 */
export const setCurrentStoryIndex = (index) => ({
  type: STORY_ACTION_TYPES.SET_CURRENT_STORY_INDEX,
  payload: index,
});

export const openStoryViewer = (startIndex = 0) => ({
  type: STORY_ACTION_TYPES.OPEN_STORY_VIEWER,
  payload: { startIndex },
});

export const closeStoryViewer = () => ({
  type: STORY_ACTION_TYPES.CLOSE_STORY_VIEWER,
});

/**
 * WebSocket connection state
 */
export const wsConnected = () => ({
  type: STORY_ACTION_TYPES.WS_CONNECTED,
});

export const wsDisconnected = () => ({
  type: STORY_ACTION_TYPES.WS_DISCONNECTED,
});

// ==========================================
// ADMIN API Actions
// ==========================================

const ADMIN_STORY_API_BASE = "/api/admin/stories";

/**
 * Fetch all stories for admin (includes all statuses)
 */
export const fetchAdminStories =
  (status = null, page = 0, size = 10) =>
  async (dispatch) => {
    dispatch({ type: STORY_ACTION_TYPES.FETCH_STORIES_REQUEST });

    try {
      let url = `${ADMIN_STORY_API_BASE}?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${status}`;
      }

      const { data } = await api.get(url);

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch admin stories";
      console.error("Fetch admin stories error:", error);
      throw error;
    }
  };

/**
 * Create a new story (admin only)
 */
export const createStory = (storyData) => async (dispatch) => {
  try {
    const { data } = await api.post(ADMIN_STORY_API_BASE, storyData);

    dispatch({
      type: STORY_ACTION_TYPES.STORY_RECEIVED,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to create story";
    console.error("Create story error:", error);
    throw error;
  }
};

/**
 * Update an existing story (admin only)
 */
export const updateStory = (storyId, storyData) => async (dispatch) => {
  try {
    const { data } = await api.put(
      `${ADMIN_STORY_API_BASE}/${storyId}`,
      storyData,
    );

    dispatch({
      type: STORY_ACTION_TYPES.STORY_UPDATED,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update story";
    console.error("Update story error:", error);
    throw error;
  }
};

/**
 * Delete a story (admin only)
 */
export const deleteStory = (storyId) => async (dispatch) => {
  try {
    await api.delete(`${ADMIN_STORY_API_BASE}/${storyId}`);

    dispatch({
      type: STORY_ACTION_TYPES.STORY_DELETED,
      payload: { storyId },
    });

    return true;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete story";
    console.error("Delete story error:", error);
    throw error;
  }
};

/**
 * Update story status (admin only) - ACTIVE, PAUSED, etc.
 */
export const updateStoryStatus = (storyId, status) => async (dispatch) => {
  try {
    const { data } = await api.patch(
      `${ADMIN_STORY_API_BASE}/${storyId}/status?status=${status}`,
    );

    dispatch({
      type: STORY_ACTION_TYPES.STORY_UPDATED,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update story status";
    console.error("Update story status error:", error);
    throw error;
  }
};

/**
 * Archive a story (admin only)
 */
export const archiveStory = (storyId) => async (dispatch) => {
  try {
    const { data } = await api.post(
      `${ADMIN_STORY_API_BASE}/${storyId}/archive`,
    );

    dispatch({
      type: STORY_ACTION_TYPES.STORY_UPDATED,
      payload: data,
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to archive story";
    console.error("Archive story error:", error);
    throw error;
  }
};

/**
 * Get story statistics for admin dashboard
 */
export const getStoryStats = () => async () => {
  try {
    const { data } = await api.get(`${ADMIN_STORY_API_BASE}/stats`);
    return data;
  } catch (error) {
    console.error("Get story stats error:", error);
    throw error;
  }
};
