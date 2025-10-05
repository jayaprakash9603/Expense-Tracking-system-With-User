import { useMemo } from "react";
import { useSelector } from "react-redux";
import { normalizeLevel } from "../utils/accessControl";

// Hook to centralize directional friend access logic.
// Pass friendId from route (can be undefined / 'undefined').
// Returns rich permission object plus convenience booleans.
export default function useFriendAccess(friendId) {
  const friendship = useSelector(
    (s) => (s.friends && s.friends.friendship) || null
  );

  // Logged in user id from auth state.
  const currentUserId = useSelector(
    (s) => s.auth?.user?.id || s.auth?.userId || null
  );

  const accessLevel = useMemo(() => {
    // Own data => FULL
    if (!friendId || friendId === "undefined" || friendId === currentUserId) {
      return "FULL";
    }
    if (!friendship || !currentUserId) return "NONE";

    const isRequester = friendship?.requester?.id === currentUserId;
    const raw = isRequester
      ? friendship?.requesterAccess
      : friendship?.recipientAccess;
    return normalizeLevel(raw);
  }, [friendship, currentUserId, friendId]);

  const hasWriteAccess = accessLevel === "WRITE" || accessLevel === "FULL";
  const canRead = ["READ", "WRITE", "FULL"].includes(accessLevel);
  const isOwn =
    !friendId || friendId === "undefined" || friendId === currentUserId;

  return {
    accessLevel,
    hasWriteAccess,
    canRead,
    isOwn,
    friendship,
    currentUserId,
    friendId,
  };
}
