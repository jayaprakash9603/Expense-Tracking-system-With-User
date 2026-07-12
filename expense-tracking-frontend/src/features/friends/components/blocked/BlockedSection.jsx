import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useBlockedUsers } from "../../hooks/useBlockedUsers";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import { friendRowSx } from "../../utils/friendsSurfaceStyles";
import FriendAvatar from "../shared/FriendAvatar";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const BlockedSection = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const currentUserId = useCurrentUserId();
  const {
    blockedUsers,
    loadingBlockedUsers,
    handleUnblock,
  } = useBlockedUsers();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": {
            bgcolor: colors.secondary_bg,
            borderRadius: 1,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: colors.primary_accent,
            borderRadius: 1,
          },
        }}
      >
        {loadingBlockedUsers && <FriendsLoadingSkeleton count={5} />}
        {!loadingBlockedUsers && blockedUsers.length === 0 && (
          <FriendsEmptyState section="blocked" />
        )}
        {!loadingBlockedUsers &&
          blockedUsers.length > 0 &&
          blockedUsers.map((user) => {
            const display = resolveFriendDisplay(user, {
              currentUserId,
              unknownLabel: t("friends.unknownUser"),
            });
            const blockedOn = user.blockedAt || user.createdAt
              ? new Date(user.blockedAt || user.createdAt).toLocaleDateString()
              : "";

            return (
              <Box
                key={display.userId}
                sx={friendRowSx(colors, { interactive: false })}
              >
                <FriendAvatar display={display} user={display.user} size={44} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.primary_text }}
                    noWrap
                  >
                    {display.displayName}
                  </Typography>
                  {display.email && (
                    <Typography variant="caption" sx={{ color: colors.secondary_text }} noWrap>
                      {display.email}
                    </Typography>
                  )}
                  {blockedOn && (
                    <Typography variant="caption" sx={{ color: colors.secondary_text, display: "block" }}>
                      {t("friends.blocked.blockedOn", { date: blockedOn })}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleUnblock(display.userId)}
                  aria-label={t("friends.actions.unblockUser")}
                  sx={{
                    minHeight: 44,
                    borderColor: colors.primary_accent,
                    color: colors.primary_accent,
                    transition: "background-color 200ms ease",
                    "&:hover": {
                      borderColor: colors.primary_accent,
                      bgcolor: `${colors.primary_accent}15`,
                    },
                  }}
                >
                  {t("friends.actions.unblockUser")}
                </Button>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default BlockedSection;
