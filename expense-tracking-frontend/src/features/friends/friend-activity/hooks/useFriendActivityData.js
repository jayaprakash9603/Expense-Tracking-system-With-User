/**
 * useFriendActivityData Hook
 * Handles fetching and managing friend activity data.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendActivities,
  fetchUnreadCount,
  fetchActivitySummary,
  markActivityAsRead,
  markAllActivitiesAsRead,
  setActivityFilters,
  resetActivityFilters,
} from "../../../../Redux/FriendActivity/friendActivity.actions";

/**
 * Custom hook for managing friend activity data
 * @param {Object} options - Configuration options
 * @returns {Object} Activity data and management functions
 */
export const useFriendActivityData = (options = {}) => {
  const { autoFetch = true, friendId = null } = options;

  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Select state from Redux
  const {
    activities,
    loadingActivities,
    activitiesError,
    unreadCount,
    summary,
    filters,
  } = useSelector((state) => state.friendActivity);

  /**
   * Fetch all activities
   */
  const fetchActivities = useCallback(async () => {
    const result = await dispatch(fetchFriendActivities());
    return result;
  }, [dispatch]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    const result = await dispatch(fetchUnreadCount());
    return result;
  }, [dispatch]);

  /**
   * Refresh activity summary
   */
  const refreshSummary = useCallback(async () => {
    const result = await dispatch(fetchActivitySummary());
    return result;
  }, [dispatch]);

  /**
   * Mark single activity as read
   */
  const markAsRead = useCallback(
    async (activityId) => {
      const result = await dispatch(markActivityAsRead(activityId));
      return result;
    },
    [dispatch],
  );

  /**
   * Mark all activities as read
   */
  const markAllAsRead = useCallback(async () => {
    const result = await dispatch(markAllActivitiesAsRead());
    return result;
  }, [dispatch]);

  /**
   * Update filters
   */
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setActivityFilters(newFilters));
    },
    [dispatch],
  );

  /**
   * Reset filters to defaults
   */
  const clearFilters = useCallback(() => {
    dispatch(resetActivityFilters());
  }, [dispatch]);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchActivities(),
      refreshUnreadCount(),
      refreshSummary(),
    ]);
  }, [fetchActivities, refreshUnreadCount, refreshSummary]);

  // Initial fetch on mount
  useEffect(() => {
    if (autoFetch && !isInitialized) {
      refreshAll();
      setIsInitialized(true);
    }
  }, [autoFetch, isInitialized, refreshAll]);

  // Filter activities by friendId if provided
  const filteredByFriend = useMemo(() => {
    if (!friendId) return activities;
    return activities.filter(
      (activity) => String(activity.actorUserId) === String(friendId),
    );
  }, [activities, friendId]);

  return {
    // Data
    activities: filteredByFriend,
    allActivities: activities,
    unreadCount,
    summary,
    filters,

    // Loading states
    loading: loadingActivities,
    error: activitiesError,
    isInitialized,

    // Actions
    fetchActivities,
    refreshUnreadCount,
    refreshSummary,
    markAsRead,
    markAllAsRead,
    updateFilters,
    clearFilters,
    refreshAll,
  };
};

export default useFriendActivityData;
