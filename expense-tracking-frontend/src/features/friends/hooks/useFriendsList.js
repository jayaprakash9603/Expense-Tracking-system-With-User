import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../../Redux/Friends/friendsActions";
import { FILTER_OPTIONS, SORT_OPTIONS } from "../constants/friendsConstants";
import {
  resolveDisplayName,
  resolveAccessLevel,
  resolveOtherUser,
} from "../utils/resolveFriendDisplay";

function getDisplayName(friend, currentUserId) {
  const other = resolveOtherUser(friend, currentUserId);
  return resolveDisplayName(other);
}

function getAccessLevel(friend, currentUserId) {
  const fr = friend.friendship || friend;
  return resolveAccessLevel(fr, currentUserId);
}

function getCreatedAt(friend) {
  const fr = friend.friendship || friend;
  return fr.createdAt || fr.updatedAt || "";
}

export function useFriendsList() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState(FILTER_OPTIONS.ALL);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC);

  const friends = useSelector((state) => state.friends?.friends ?? []);
  const loadingFriends = useSelector((state) => state.friends?.loadingFriends ?? false);
  const friendsError = useSelector((state) => state.friends?.friendsError ?? null);
  const currentUserId = useSelector(
    (state) => state.auth?.user?.id || state.auth?.userId || null
  );

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const filteredFriends = useMemo(() => {
    const lower = searchQuery.toLowerCase().trim();
    let result = friends.filter((f) => {
      const name = getDisplayName(f, currentUserId);
      const other = resolveOtherUser(f, currentUserId);
      const email = (other?.email || "").toLowerCase();
      return !lower || name.toLowerCase().includes(lower) || email.includes(lower);
    });

    if (filterOption === FILTER_OPTIONS.HAS_ACCESS) {
      result = result.filter((f) => getAccessLevel(f, currentUserId) !== "NONE");
    } else if (filterOption === FILTER_OPTIONS.NO_ACCESS) {
      result = result.filter((f) => getAccessLevel(f, currentUserId) === "NONE");
    } else if (filterOption === FILTER_OPTIONS.RECENT) {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((f) => new Date(getCreatedAt(f)).getTime() >= weekAgo);
    }

    const sorted = [...result].sort((a, b) => {
      const nameA = getDisplayName(a, currentUserId);
      const nameB = getDisplayName(b, currentUserId);
      const accessA = getAccessLevel(a, currentUserId);
      const accessB = getAccessLevel(b, currentUserId);
      const dateA = new Date(getCreatedAt(a)).getTime();
      const dateB = new Date(getCreatedAt(b)).getTime();

      switch (sortOption) {
        case SORT_OPTIONS.NAME_ASC:
          return nameA.localeCompare(nameB);
        case SORT_OPTIONS.NAME_DESC:
          return nameB.localeCompare(nameA);
        case SORT_OPTIONS.RECENT:
          return dateB - dateA;
        case SORT_OPTIONS.ACCESS_LEVEL:
          return accessB.localeCompare(accessA);
        default:
          return nameA.localeCompare(nameB);
      }
    });

    return sorted;
  }, [friends, searchQuery, filterOption, sortOption, currentUserId]);

  return {
    friends,
    loadingFriends,
    friendsError,
    searchQuery,
    setSearchQuery,
    filterOption,
    setFilterOption,
    sortOption,
    setSortOption,
    filteredFriends,
  };
}
