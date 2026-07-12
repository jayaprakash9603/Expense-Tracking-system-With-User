import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendSuggestions,
  searchFriends,
  sendFriendRequest,
} from "../../../Redux/Friends/friendsActions";

const MIN_SEARCH_LENGTH = 2;

export function useDiscover() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = useSelector((state) => state.friends?.suggestions ?? []);
  const loading = useSelector((state) => state.friends?.loading ?? false);
  const searchResults = useSelector((state) => state.friends?.searchResults ?? []);
  const searchingFriends = useSelector((state) => state.friends?.searchingFriends ?? false);
  const mutualFriends = useSelector((state) => state.friends?.mutualFriends ?? {});
  const sentRequests = useSelector((state) => state.friends?.sentRequests ?? []);

  useEffect(() => {
    dispatch(fetchFriendSuggestions());
  }, [dispatch]);

  const handleSearch = useCallback(
    (query) => {
      if (query && query.length >= MIN_SEARCH_LENGTH) {
        dispatch(searchFriends(query));
      }
    },
    [dispatch]
  );

  const handleSendRequest = useCallback(
    (userId) => dispatch(sendFriendRequest(userId)),
    [dispatch]
  );

  const isRequestSent = useCallback(
    (userId) => sentRequests.includes(userId),
    [sentRequests]
  );

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    loading,
    searchResults,
    searchingFriends,
    mutualFriends,
    sentRequests,
    handleSearch,
    handleSendRequest,
    isRequestSent,
  };
}
