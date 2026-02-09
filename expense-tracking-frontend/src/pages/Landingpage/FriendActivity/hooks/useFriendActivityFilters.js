/**
 * useFriendActivityFilters Hook
 * Handles filtering, sorting, and searching of friend activities.
 */

import { useState, useMemo, useCallback } from "react";
import {
  SERVICES,
  ACTIONS,
  READ_STATUS,
  SORT_OPTIONS,
  SORT_ORDER,
  TIME_RANGES,
  DEFAULT_FILTERS,
} from "../constants";
import { getSearchableText } from "../utils";
import dayjs from "dayjs";

/**
 * Custom hook for filtering and sorting friend activities
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Filtered data and filter management functions
 */
export const useFriendActivityFilters = (activities = []) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update multiple filter values
   */
  const updateFilters = useCallback((updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== "" ||
      filters.serviceFilter !== SERVICES.ALL ||
      filters.actionFilter !== ACTIONS.ALL ||
      filters.friendFilter !== null ||
      filters.timeRange !== TIME_RANGES.ALL ||
      filters.readStatus !== READ_STATUS.ALL
    );
  }, [filters]);

  /**
   * Filter activities by time range
   */
  const filterByTimeRange = useCallback((items, timeRange, dateRange) => {
    if (timeRange === TIME_RANGES.ALL && !dateRange) return items;

    const now = dayjs();

    return items.filter((activity) => {
      const activityDate = dayjs(activity.timestamp);

      switch (timeRange) {
        case TIME_RANGES.TODAY:
          return activityDate.isSame(now, "day");
        case TIME_RANGES.WEEK:
          return activityDate.isAfter(now.subtract(7, "day"));
        case TIME_RANGES.MONTH:
          return activityDate.isAfter(now.subtract(30, "day"));
        case TIME_RANGES.CUSTOM:
          if (dateRange?.start && dateRange?.end) {
            return (
              activityDate.isAfter(dayjs(dateRange.start).subtract(1, "day")) &&
              activityDate.isBefore(dayjs(dateRange.end).add(1, "day"))
            );
          }
          return true;
        default:
          return true;
      }
    });
  }, []);

  /**
   * Apply all filters to activities
   */
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter((activity) =>
        getSearchableText(activity).includes(searchLower),
      );
    }

    // Service filter
    if (filters.serviceFilter !== SERVICES.ALL) {
      result = result.filter(
        (activity) => activity.sourceService === filters.serviceFilter,
      );
    }

    // Action filter
    if (filters.actionFilter !== ACTIONS.ALL) {
      result = result.filter(
        (activity) => activity.action === filters.actionFilter,
      );
    }

    // Friend filter
    if (filters.friendFilter !== null) {
      result = result.filter(
        (activity) =>
          String(activity.actorUserId) === String(filters.friendFilter),
      );
    }

    // Time range filter
    result = filterByTimeRange(result, filters.timeRange, filters.dateRange);

    // Read status filter
    if (filters.readStatus !== READ_STATUS.ALL) {
      const isRead = filters.readStatus === READ_STATUS.READ;
      result = result.filter((activity) => activity.isRead === isRead);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case SORT_OPTIONS.TIMESTAMP:
          comparison = dayjs(b.timestamp).diff(dayjs(a.timestamp));
          break;
        case SORT_OPTIONS.ACTION:
          comparison = (a.action || "").localeCompare(b.action || "");
          break;
        case SORT_OPTIONS.SERVICE:
          comparison = (a.sourceService || "").localeCompare(
            b.sourceService || "",
          );
          break;
        case SORT_OPTIONS.AMOUNT:
          comparison = (b.amount || 0) - (a.amount || 0);
          break;
        case SORT_OPTIONS.FRIEND:
          comparison = (a.actorUserName || "").localeCompare(
            b.actorUserName || "",
          );
          break;
        default:
          comparison = dayjs(b.timestamp).diff(dayjs(a.timestamp));
      }

      return filters.sortOrder === SORT_ORDER.ASC ? -comparison : comparison;
    });

    return result;
  }, [activities, filters, filterByTimeRange]);

  /**
   * Calculate statistics for filtered data
   */
  const filterStats = useMemo(() => {
    const total = activities.length;
    const filtered = filteredActivities.length;
    const unread = filteredActivities.filter((a) => !a.isRead).length;

    return {
      total,
      filtered,
      unread,
      hidden: total - filtered,
    };
  }, [activities, filteredActivities]);

  /**
   * Get unique friends from activities for filter dropdown
   */
  const uniqueFriends = useMemo(() => {
    const friendMap = new Map();

    activities.forEach((activity) => {
      if (activity.actorUserId && !friendMap.has(activity.actorUserId)) {
        friendMap.set(activity.actorUserId, {
          id: activity.actorUserId,
          name: activity.actorUserName || `User ${activity.actorUserId}`,
          user: activity.actorUser,
        });
      }
    });

    return Array.from(friendMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [activities]);

  return {
    // Filter state
    filters,

    // Filtered data
    filteredActivities,
    filterStats,

    // Filter options
    uniqueFriends,
    hasActiveFilters,

    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
  };
};

export default useFriendActivityFilters;
