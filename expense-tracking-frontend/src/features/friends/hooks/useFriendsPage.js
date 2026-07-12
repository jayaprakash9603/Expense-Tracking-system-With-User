import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendshipStats } from "../../../Redux/Friends/friendsActions";
import { FRIEND_SECTIONS } from "../constants/friendsConstants";

export function useFriendsPage() {
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState(FRIEND_SECTIONS.MY_FRIENDS);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const friendshipStats = useSelector((state) => state.friends?.friendshipStats ?? null);
  const loadingFriendshipStats = useSelector((state) => state.friends?.loadingFriendshipStats ?? false);
  const friendRequests = useSelector((state) => state.friends?.friendRequests ?? []);

  const pendingCount = friendRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  useEffect(() => {
    dispatch(fetchFriendshipStats());
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchFriendshipStats());
    setIsRefreshing(false);
  }, [dispatch]);

  return {
    activeSection,
    setActiveSection,
    selectedFriend,
    setSelectedFriend,
    isDetailOpen,
    setIsDetailOpen,
    friendshipStats,
    loadingFriendshipStats,
    refreshAll,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    pendingCount,
  };
}
