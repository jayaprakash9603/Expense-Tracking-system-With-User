import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useBlockedUsers } from "../../hooks/useBlockedUsers";
import FriendAvatar from "../shared/FriendAvatar";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const BlockedSection = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
            const u = user.user || user.recipient || user;
            const displayName = [u.firstName, u.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || u.name || "?";
            const blockedOn = user.blockedAt || user.createdAt
              ? new Date(user.blockedAt || user.createdAt).toLocaleDateString()
              : "";

            return (
              <Box
                key={u.id || user.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  mb: 1,
                  bgcolor: colors.card_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: 2,
                }}
              >
                <FriendAvatar user={u} size={44} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.primary_text }}
                    noWrap
                  >
                    {displayName}
                  </Typography>
                  {blockedOn && (
                    <Typography variant="caption" sx={{ color: colors.secondary_text }}>
                      {t("friends.blockedOn")} {blockedOn}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleUnblock(u.id || user.id)}
                  sx={{
                    borderColor: colors.primary_accent,
                    color: colors.primary_accent,
                    "&:hover": {
                      borderColor: colors.primary_accent,
                      bgcolor: `${colors.primary_accent}15`,
                    },
                  }}
                >
                  {t("friends.unblock")}
                </Button>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default BlockedSection;
