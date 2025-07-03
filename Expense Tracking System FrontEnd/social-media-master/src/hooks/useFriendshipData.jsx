import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFriendship } from "../Redux/Friends/friends.action";
import { fetchFriendsDetailed } from "../Redux/Friends/friendsActions";
import { fetchCashflowExpenses } from "../Redux/Expenses/expense.action";

// You'll need to import these actions - adjust the paths based on your actual Redux structure

/**
 * Custom hook to manage friendship data and related operations
 * @param {string} friendId - The ID of the friend
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to automatically fetch data on mount
 * @param {boolean} options.fetchExpenses - Whether to fetch expenses data
 * @param {Object} options.expenseFilters - Filters for expense fetching
 * @returns {Object} Friendship data and utility functions
 */
export const useFriendshipData = (friendId, options = {}) => {
  const {
    autoFetch = true,
    fetchExpenses = false,
    expenseFilters = {
      activeRange: "month",
      offset: 0,
      flowTab: "all",
      search: "",
    },
  } = options;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    friendship,
    friends,
    loading: friendsLoading,
  } = useSelector((state) => state.friends);
  const { loading: expensesLoading } = useSelector((state) => state.expenses);

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFriendInfo, setShowFriendInfo] = useState(true);

  // Combined loading state
  const loading = friendsLoading || expensesLoading || isRefreshing;

  /**
   * Fetch friendship data for a specific friend
   */
  const fetchFriendshipData = useCallback(
    async (targetFriendId) => {
      if (!targetFriendId || targetFriendId === "undefined") return;

      try {
        setError(null);
        await dispatch(fetchFriendship(targetFriendId));
      } catch (err) {
        console.error("Error fetching friendship data:", err);
        setError("Failed to load friendship data");
      }
    },
    [dispatch]
  );

  /**
   * Fetch detailed friends list
   */
  const fetchFriendsData = useCallback(async () => {
    try {
      setError(null);
      await dispatch(fetchFriendsDetailed());
    } catch (err) {
      console.error("Error fetching friends data:", err);
      setError("Failed to load friends data");
    }
  }, [dispatch]);

  /**
   * Fetch expenses data if needed
   */
  const fetchExpensesData = useCallback(
    async (targetFriendId, filters = expenseFilters) => {
      if (!fetchExpenses || !targetFriendId) return;

      try {
        setError(null);
        const { activeRange, offset, flowTab, search } = filters;
        await dispatch(
          fetchCashflowExpenses(
            activeRange,
            offset,
            flowTab === "all" ? null : flowTab,
            search.trim() || null,
            targetFriendId
          )
        );
      } catch (err) {
        console.error("Error fetching expenses data:", err);
        setError("Failed to load expenses data");
      }
    },
    [dispatch, fetchExpenses, expenseFilters]
  );

  /**
   * Handle route change to a different friend
   */
  const handleRouteChange = useCallback(
    async (newFriendId) => {
      try {
        if (!newFriendId || newFriendId === friendId) return;

        // Navigate to the new friend's page
        const currentPath = window.location.pathname;
        const basePath = currentPath.replace(`/${friendId}`, "");
        navigate(`${basePath}/${newFriendId}`);
      } catch (error) {
        console.error("Error changing route:", error);
        setError("Failed to navigate to friend's page");
      }
    },
    [navigate, friendId]
  );

  /**
   * Refresh all data for a specific friend
   */
  const refreshData = useCallback(
    async (targetFriendId = friendId, filters = expenseFilters) => {
      if (!targetFriendId || targetFriendId === "undefined") return;

      try {
        setIsRefreshing(true);
        setError(null);

        // Fetch all necessary data in parallel
        const promises = [
          fetchFriendshipData(targetFriendId),
          fetchFriendsData(),
        ];

        // Add expenses fetch if needed
        if (fetchExpenses) {
          promises.push(fetchExpensesData(targetFriendId, filters));
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error refreshing data:", error);
        setError("Error loading friend data. Please try again.");
      } finally {
        setIsRefreshing(false);
      }
    },
    [
      friendId,
      fetchFriendshipData,
      fetchFriendsData,
      fetchExpensesData,
      fetchExpenses,
      expenseFilters,
    ]
  );

  /**
   * Initialize data on mount or when friendId changes
   */
  useEffect(() => {
    if (autoFetch) {
      // Fetch friends list on mount
      fetchFriendsData();

      // Fetch specific friendship data if friendId is provided
      if (friendId && friendId !== "undefined") {
        fetchFriendshipData(friendId);

        // Fetch expenses if needed
        if (fetchExpenses) {
          fetchExpensesData(friendId);
        }
      }
    }
  }, [
    autoFetch,
    friendId,
    fetchFriendsData,
    fetchFriendshipData,
    fetchExpensesData,
    fetchExpenses,
  ]);

  /**
   * Get current friend details from friends list
   */
  const getCurrentFriend = useCallback(() => {
    if (!friendId || !friends || friends.length === 0) return null;
    return friends.find(
      (friend) => friend.id?.toString() === friendId?.toString()
    );
  }, [friendId, friends]);

  /**
   * Check if current user has access to friend's data
   */
  const hasAccess = useCallback(() => {
    if (!friendship) return false;
    return (
      friendship.status === "ACCEPTED" &&
      (friendship.requesterAccess !== "NONE" ||
        friendship.recipientAccess !== "NONE")
    );
  }, [friendship]);

  /**
   * Get access level for current user
   */
  const getAccessLevel = useCallback(() => {
    if (!friendship) return "NONE";
    // This logic might need adjustment based on your friendship model
    return friendship.requesterAccess || friendship.recipientAccess || "NONE";
  }, [friendship]);

  /**
   * Toggle friend info bar visibility
   */
  const toggleFriendInfo = useCallback(() => {
    setShowFriendInfo((prev) => !prev);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    friendship,
    friends: friends || [],
    currentFriend: getCurrentFriend(),

    // State
    loading,
    isRefreshing,
    error,
    showFriendInfo,

    // Access control
    hasAccess: hasAccess(),
    accessLevel: getAccessLevel(),

    // Actions
    refreshData,
    handleRouteChange,
    fetchFriendshipData,
    fetchFriendsData,
    fetchExpensesData,
    toggleFriendInfo,
    setShowFriendInfo,
    clearError,

    // Utilities
    isValidFriendId: friendId && friendId !== "undefined",
  };
};

export default useFriendshipData;
