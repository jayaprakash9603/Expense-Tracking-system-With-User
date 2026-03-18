import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../../Redux/Friends/friendsActions";
import { FILTER_OPTIONS, SORT_OPTIONS } from "../constants/friendsConstants";

function getDisplayName(friend) {
  const other = friend.recipient || friend;
  const first = other.firstName || "";
  const last = other.lastName || "";
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || other.name || "";
}

function getAccessLevel(friend) {
  const fr = friend.friendship || friend;
  return fr.requesterAccess || fr.recipientAccess || fr.accessLevel || "NONE";
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

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const filteredFriends = useMemo(() => {
    const lower = searchQuery.toLowerCase().trim();
    let result = friends.filter((f) => {
      const name = getDisplayName(f);
      return !lower || name.toLowerCase().includes(lower);
    });

    if (filterOption === FILTER_OPTIONS.HAS_ACCESS) {
      result = result.filter((f) => getAccessLevel(f) !== "NONE");
    } else if (filterOption === FILTER_OPTIONS.NO_ACCESS) {
      result = result.filter((f) => getAccessLevel(f) === "NONE");
    } else if (filterOption === FILTER_OPTIONS.RECENT) {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((f) => new Date(getCreatedAt(f)).getTime() >= weekAgo);
    }

    const sorted = [...result].sort((a, b) => {
      const nameA = getDisplayName(a);
      const nameB = getDisplayName(b);
      const accessA = getAccessLevel(a);
      const accessB = getAccessLevel(b);
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
  }, [friends, searchQuery, filterOption, sortOption]);

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
