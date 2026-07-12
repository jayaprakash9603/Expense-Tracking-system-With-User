import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "../../../hooks/useTranslation";
import { toast } from "react-toastify";
import {
  blockUser,
  unblockUser,
  removeFriendship,
  setAccessLevel,
  sendFriendRequest,
  fetchMutualFriends,
} from "../../../Redux/Friends/friendsActions";
import { ACCESS_LEVEL_OPTIONS } from "../constants/friendsConstants";

export function useFriendActions() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleBlock = useCallback(
    async (userId) => {
      const result = await dispatch(blockUser(userId));
      if (result?.success) {
        toast.success(t("friends.toast.userBlocked", { name: "User" }));
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error(t("friends.toast.errorGeneric"));
      }
    },
    [dispatch, t]
  );

  const handleUnblock = useCallback(
    async (userId) => {
      const result = await dispatch(unblockUser(userId));
      if (result?.success) {
        toast.success(t("friends.toast.userUnblocked", { name: "User" }));
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error(t("friends.toast.errorGeneric"));
      }
    },
    [dispatch, t]
  );

  const handleRemoveFriend = useCallback(
    async (friendshipId) => {
      const result = await dispatch(removeFriendship(friendshipId));
      if (result?.success) {
        toast.success(t("friends.toast.friendRemoved", { name: "Friend" }));
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error(t("friends.toast.errorGeneric"));
      }
    },
    [dispatch, t]
  );

  const handleSetAccess = useCallback(
    async (friendshipId, accessLevel) => {
      const result = await dispatch(setAccessLevel(friendshipId, accessLevel));
      if (result?.success) {
        const levelLabel = ACCESS_LEVEL_OPTIONS.find((o) => o.value === accessLevel)?.labelKey;
        toast.success(
          t("friends.toast.accessUpdated", {
            level: levelLabel ? t(levelLabel) : accessLevel,
          })
        );
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error(t("friends.toast.errorGeneric"));
      }
    },
    [dispatch, t]
  );

  const handleSendRequest = useCallback(
    async (userId) => {
      const result = await dispatch(sendFriendRequest(userId));
      if (result?.success) {
        toast.success(t("friends.toast.requestSent", { name: "User" }));
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error(t("friends.toast.errorGeneric"));
      }
    },
    [dispatch, t]
  );

  const fetchMutualForUser = useCallback(
    (userId) => dispatch(fetchMutualFriends(userId)),
    [dispatch]
  );

  return {
    handleBlock,
    handleUnblock,
    handleRemoveFriend,
    handleSetAccess,
    handleSendRequest,
    fetchMutualForUser,
  };
}
