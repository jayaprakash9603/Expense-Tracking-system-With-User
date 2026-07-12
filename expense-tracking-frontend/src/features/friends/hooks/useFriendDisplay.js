import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "../../../hooks/useTranslation";
import { resolveFriendDisplay } from "../utils/resolveFriendDisplay";

export function useCurrentUserId() {
  return useSelector((state) => state.auth?.user?.id || state.auth?.userId || null);
}

export function useFriendDisplay(obj, overrides = {}) {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();
  const unknownLabel = t("friends.unknownUser");

  return useMemo(
    () =>
      resolveFriendDisplay(obj, {
        currentUserId: overrides.currentUserId ?? currentUserId,
        unknownLabel: overrides.unknownLabel ?? unknownLabel,
      }),
    [obj, currentUserId, unknownLabel, overrides.currentUserId, overrides.unknownLabel]
  );
}

export default useFriendDisplay;
