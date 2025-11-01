import axios from 'axios';
import * as actionTypes from './notificationPreferences.actionType';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Helper to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Helper to get user ID from token or state
const getUserId = (getState) => {
  const state = getState();
  return state.auth?.user?.id || state.auth?.jwt?.id;
};

/**
 * Fetch notification preferences
 * Auto-creates defaults if none exist
 */
export const fetchNotificationPreferences = () => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/notification-preferences`,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notification preferences';
    
    dispatch({
      type: actionTypes.FETCH_NOTIFICATION_PREFERENCES_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Update notification preferences (partial update)
 * Only sends fields that need to be updated
 */
export const updateNotificationPreference = (updates) => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/notification-preferences`,
      updates,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update notification preference';
    
    dispatch({
      type: actionTypes.UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Reset notification preferences to defaults
 */
export const resetNotificationPreferences = () => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.RESET_NOTIFICATION_PREFERENCES_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/notification-preferences/reset`,
      null,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.RESET_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to reset notification preferences';
    
    dispatch({
      type: actionTypes.RESET_NOTIFICATION_PREFERENCES_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Delete notification preferences
 */
export const deleteNotificationPreferences = () => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    await axios.delete(
      `${API_BASE_URL}/api/notification-preferences`,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_SUCCESS,
    });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notification preferences';
    
    dispatch({
      type: actionTypes.DELETE_NOTIFICATION_PREFERENCES_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Check if notification preferences exist
 */
export const checkNotificationPreferencesExist = () => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/notification-preferences/exists`,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to check notification preferences existence';
    
    dispatch({
      type: actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Create default notification preferences
 */
export const createDefaultNotificationPreferences = () => async (dispatch, getState) => {
  try {
    dispatch({ type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_REQUEST });

    const userId = getUserId(getState);
    const token = localStorage.getItem('token');

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/notification-preferences/default`,
      null,
      {
        headers: {
          ...getAuthHeaders(token),
          'X-User-Id': userId,
        },
      }
    );

    dispatch({
      type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create default notification preferences';
    
    dispatch({
      type: actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};
