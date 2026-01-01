import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchFriendsDetailed,
  fetchFriendship,
} from "../../Redux/Friends/friendsActions";

export const useFriendInfoBar = (friendId, options = {}) => {
  const {
    autoFetchFriends = true,
    autoFetchFriendship = true,
    redirectOnError = true,
    errorRedirectPath = "/expenses",
  } = options;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { friendship, friends, loading } = useSelector(
    (state) => state.friends
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch friends list on mount
  useEffect(() => {
    if (autoFetchFriends) {
      dispatch(fetchFriendsDetailed()).catch((err) => {
        console.error("Error fetching friends:", err);
        setError(err);
      });
    }
  }, [dispatch, autoFetchFriends]);

  // Fetch specific friendship when friendId changes
  useEffect(() => {
    if (autoFetchFriendship && friendId && friendId !== "undefined") {
      dispatch(fetchFriendship(friendId)).catch((err) => {
        console.error("Error fetching friendship:", err);
        setError(err);

        // Handle 403 errors
        if (redirectOnError && err.response && err.response.status === 403) {
          console.warn("Access denied for friend:", friendId);
          navigate(errorRedirectPath);
        }
      });
    }
  }, [
    dispatch,
    friendId,
    autoFetchFriendship,
    redirectOnError,
    errorRedirectPath,
    navigate,
  ]);

  // Handle route change with error handling
  const handleRouteChange = useCallback(
    async (newFriendId) => {
      try {
        navigate(`/friends/expenses/${newFriendId}`);
      } catch (error) {
        console.error("Error changing route:", error);

        if (error.response && error.response.status === 403) {
          console.warn("Access denied during route change");
          navigate(errorRedirectPath);
        }
      }
    },
    [navigate, errorRedirectPath]
  );

  // Refresh all friend data
  const refreshData = useCallback(
    async (newFriendId = friendId, additionalRefreshFn = null) => {
      try {
        setIsRefreshing(true);
        setError(null);

        const promises = [
          dispatch(fetchFriendship(newFriendId)),
          dispatch(fetchFriendsDetailed()),
        ];

        // Add additional refresh function if provided
        if (additionalRefreshFn && typeof additionalRefreshFn === "function") {
          promises.push(additionalRefreshFn(newFriendId));
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error refreshing data:", error);
        setError(error);

        if (
          redirectOnError &&
          error.response &&
          error.response.status === 403
        ) {
          console.warn(
            "Access denied during data refresh for friend:",
            newFriendId
          );
          navigate(errorRedirectPath);
        }

        return error; // Re-throw so components can handle it
      } finally {
        setIsRefreshing(false);
      }
    },
    [dispatch, friendId, redirectOnError, errorRedirectPath, navigate]
  );

  // Manual fetch functions for specific use cases
  const fetchFriends = useCallback(() => {
    return dispatch(fetchFriendsDetailed());
  }, [dispatch]);

  const fetchFriendshipData = useCallback(
    (targetFriendId = friendId) => {
      if (targetFriendId && targetFriendId !== "undefined") {
        return dispatch(fetchFriendship(targetFriendId));
      }
      return Promise.resolve();
    },
    [dispatch, friendId]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    friendship,
    friends: friends || [],
    loading,
    isRefreshing,
    error,

    // Actions
    handleRouteChange,
    refreshData,
    fetchFriends,
    fetchFriendshipData,
    clearError,

    // Utils
    friendId,
    isValidFriendId: friendId && friendId !== "undefined",
  };
};

export default useFriendInfoBar;
