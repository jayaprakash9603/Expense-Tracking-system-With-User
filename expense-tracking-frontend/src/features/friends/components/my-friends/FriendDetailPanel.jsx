import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slide,
  Drawer,
  useMediaQuery,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useFeature } from "../../../../hooks/useFeature";
import { SUB_FEATURE_KEYS } from "../../../../config/featureCatalog";
import { BREAKPOINTS } from "../../constants/friendsConstants";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import FriendAvatar from "../shared/FriendAvatar";
import AccessLevelPicker from "../shared/AccessLevelPicker";

const FriendDetailPanel = ({
  friend,
  onClose,
  mutualFriends = [],
  onSetAccess,
  onRemove,
  onBlock,
  onViewExpenses,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const friendsEditEnabled = useFeature(SUB_FEATURE_KEYS.FRIENDS_EDIT);
  const friendsDeleteEnabled = useFeature(SUB_FEATURE_KEYS.FRIENDS_DELETE);
  const friendsChatEnabled = useFeature(SUB_FEATURE_KEYS.FRIENDS_CHAT);
  const currentUserId = useCurrentUserId();
  const isMobile = useMediaQuery(`(max-width:${BREAKPOINTS.MOBILE}px)`);

  if (!friend) return null;

  const friendship = friend.friendship || friend;
  const display = resolveFriendDisplay(friend, {
    currentUserId,
    unknownLabel: t("friends.unknownUser"),
  });
  const friendsSince = friendship.createdAt
    ? new Date(friendship.createdAt).toLocaleDateString()
    : "";

  const panelContent = (
    <Box
      sx={{
        width: isMobile ? "100%" : 360,
        height: "100%",
        bgcolor: colors.card_bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label={t("common.close")}
          sx={{ color: colors.secondary_text, minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, flex: 1, overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <FriendAvatar display={display} user={display.user} size={isMobile ? 64 : 80} />
          <Typography
            variant="h6"
            sx={{ mt: 2, fontWeight: 600, color: colors.primary_text, textAlign: "center" }}
          >
            {display.displayName}
          </Typography>
          {display.email && (
            <Typography variant="body2" sx={{ color: colors.secondary_text, mt: 0.5 }}>
              {display.email}
            </Typography>
          )}
          {friendsSince && (
            <Typography variant="body2" sx={{ color: colors.secondary_text, mt: 0.5 }}>
              {t("friends.detail.friendSince", { date: friendsSince })}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.border_color }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: colors.secondary_text, mb: 1, display: "block" }}>
            {t("friends.detail.currentAccess")}
          </Typography>
          {friendsEditEnabled && (
          <AccessLevelPicker
            value={display.accessLevel}
            onChange={(val) => onSetAccess?.(friendship.id, val)}
          />
          )}
        </Box>

        {mutualFriends.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: colors.secondary_text, mb: 1 }}>
              {t("friends.detail.mutualFriends")} ({mutualFriends.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {mutualFriends.slice(0, 8).map((m) => {
                const mutualDisplay = resolveFriendDisplay(m, {
                  currentUserId,
                  unknownLabel: t("friends.unknownUser"),
                });
                return (
                  <FriendAvatar
                    key={mutualDisplay.userId || m.id}
                    display={mutualDisplay}
                    user={mutualDisplay.user}
                    size={32}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {onViewExpenses && friendsChatEnabled && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<VisibilityIcon />}
              onClick={() => onViewExpenses(friend.id || display.userId)}
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
              {t("friends.actions.viewExpenses")}
            </Button>
          )}
          {friendsDeleteEnabled && (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<PersonRemoveIcon />}
            onClick={() => onRemove?.(friendship.id)}
            sx={{
              minHeight: 44,
              borderColor: colors.error,
              color: colors.error,
              transition: "background-color 200ms ease",
              "&:hover": {
                borderColor: colors.error,
                bgcolor: `${colors.error}15`,
              },
            }}
          >
            {t("friends.actions.removeFriend")}
          </Button>
          )}
          {friendsEditEnabled && (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<BlockIcon />}
            onClick={() => onBlock?.(friend.id || display.userId)}
            sx={{
              minHeight: 44,
              borderColor: colors.error,
              color: colors.error,
              transition: "background-color 200ms ease",
              "&:hover": {
                borderColor: colors.error,
                bgcolor: `${colors.error}15`,
              },
            }}
          >
            {t("friends.actions.blockUser")}
          </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={Boolean(friend)}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 400,
            bgcolor: colors.card_bg,
          },
        }}
        ModalProps={{ keepMounted: false }}
      >
        {panelContent}
      </Drawer>
    );
  }

  return (
    <Slide direction="left" in={Boolean(friend)} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 360,
          height: "100%",
        }}
      >
        {panelContent}
      </Box>
    </Slide>
  );
};

export default FriendDetailPanel;
