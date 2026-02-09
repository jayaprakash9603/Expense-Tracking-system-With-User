import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "./useFriendAccess";

/**
 * Generic read-only redirect hook to enforce write permissions.
 *
 * Usage:
 * const { enforce } = useRedirectIfReadOnly(friendId, {
 *   buildFriendPath: (fid) => `/bill/${fid}`,
 *   selfPath: '/bill',
 *   defaultPath: '/',
 * });
 * (The hook auto-runs; return object reserved for future extensibility.)
 *
 * Options:
 *  - buildFriendPath(friendId): path when friend context exists.
 *  - selfPath: path when operating on own data (no friendId).
 *  - defaultPath: fallback path if neither apply.
 *  - getFrom(location): extract origin route key from location.state (defaults to location.state.from).
 */
export default function useRedirectIfReadOnly(friendId, options = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  // If friendId omitted, try from params for convenience
  const params = useParams();
  const effectiveFriendId = friendId !== undefined ? friendId : params.friendId;

  const { hasWriteAccess } = useFriendAccess(effectiveFriendId);

  const {
    buildFriendPath = (fid) => `/bill/${fid}`,
    selfPath = "/bill",
    defaultPath = "/",
    getFrom = (loc) => loc?.state?.from,
    replace = true,
    auto = true,
  } = options || {};

  useEffect(() => {
    if (!auto) return; // allow manual invocation pattern
    if (hasWriteAccess) return; // allowed through

    const from = getFrom(location);
    if (from) {
      navigate(from, { replace });
      return;
    }

    if (effectiveFriendId) {
      navigate(buildFriendPath(effectiveFriendId), { replace });
    } else if (selfPath) {
      navigate(selfPath, { replace });
    } else {
      navigate(defaultPath, { replace });
    }
  }, [
    auto,
    hasWriteAccess,
    location,
    navigate,
    effectiveFriendId,
    buildFriendPath,
    selfPath,
    defaultPath,
    getFrom,
    replace,
  ]);

  return { hasWriteAccess };
}
