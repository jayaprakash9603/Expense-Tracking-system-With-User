import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlockedUsers,
  blockUser,
  unblockUser,
} from "../../../Redux/Friends/friendsActions";

export function useBlockedUsers() {
  const dispatch = useDispatch();

  const blockedUsers = useSelector((state) => state.friends?.blockedUsers ?? []);
  const loadingBlockedUsers = useSelector((state) => state.friends?.loadingBlockedUsers ?? false);
  const blockingUser = useSelector((state) => state.friends?.blockingUser ?? false);
  const unblockingUser = useSelector((state) => state.friends?.unblockingUser ?? false);

  useEffect(() => {
    dispatch(fetchBlockedUsers());
  }, [dispatch]);

  const handleBlock = useCallback((userId) => dispatch(blockUser(userId)), [dispatch]);

  const handleUnblock = useCallback((userId) => dispatch(unblockUser(userId)), [dispatch]);

  return {
    blockedUsers,
    loadingBlockedUsers,
    blockingUser,
    unblockingUser,
    handleBlock,
    handleUnblock,
  };
}
