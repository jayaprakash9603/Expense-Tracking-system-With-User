import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slide,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { BREAKPOINTS } from "../../constants/friendsConstants";
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
  const isMobile = useMediaQuery(`(max-width:${BREAKPOINTS.MOBILE}px)`);

  if (!friend) return null;

  const other = friend.recipient || friend;
  const friendship = friend.friendship || friend;
  const displayName = [other.firstName, other.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || other.name || "?";
  const userForAvatar = {
    firstName: other.firstName,
    lastName: other.lastName,
    profilePicture: other.profilePicture,
  };
  const currentAccess =
    friendship.requesterAccess ||
    friendship.recipientAccess ||
    friendship.accessLevel ||
    "NONE";
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
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderBottom: `1px solid ${colors.border_color}`,
        }}
      >
        <IconButton onClick={onClose} sx={{ color: colors.secondary_text }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <FriendAvatar user={userForAvatar} size={isMobile ? 64 : 80} />
          <Typography
            variant="h6"
            sx={{ mt: 2, fontWeight: 600, color: colors.primary_text, textAlign: "center" }}
          >
            {displayName}
          </Typography>
          {friendsSince && (
            <Typography variant="body2" sx={{ color: colors.secondary_text, mt: 0.5 }}>
              {t("friends.friendsSince")} {friendsSince}
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: colors.secondary_text, mb: 1, display: "block" }}>
            {t("friends.accessLevel")}
          </Typography>
          <AccessLevelPicker
            value={currentAccess}
            onChange={(val) => onSetAccess?.(friendship.id, val)}
          />
        </Box>
        {mutualFriends.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: colors.secondary_text, mb: 1 }}>
              {t("friends.mutualFriends")} ({mutualFriends.length})
            </Typography>
            <Box sx={{ display: "flex", gap: -0.5, flexWrap: "wrap" }}>
              {mutualFriends.slice(0, 8).map((m) => (
                <FriendAvatar
                  key={m.id}
                  user={m.recipient || m}
                  size={32}
                />
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {onViewExpenses && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<VisibilityIcon />}
              onClick={() => onViewExpenses(friend.id || other.id)}
              sx={{
                borderColor: colors.primary_accent,
                color: colors.primary_accent,
                "&:hover": {
                  borderColor: colors.primary_accent,
                  bgcolor: `${colors.primary_accent}15`,
                },
              }}
            >
              {t("friends.actions.viewExpenses")}
            </Button>
          )}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<PersonRemoveIcon />}
            onClick={() => onRemove?.(friendship.id)}
            sx={{
              borderColor: colors.error,
              color: colors.error,
              "&:hover": {
                borderColor: colors.error,
                bgcolor: `${colors.error}15`,
              },
            }}
          >
            {t("friends.actions.removeFriend")}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<BlockIcon />}
            onClick={() => onBlock?.(friend.id || other.id)}
            sx={{
              borderColor: colors.error,
              color: colors.error,
              "&:hover": {
                borderColor: colors.error,
                bgcolor: `${colors.error}15`,
              },
            }}
          >
            {t("friends.actions.blockUser")}
          </Button>
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
          borderLeft: `1px solid ${colors.border_color}`,
        }}
      >
        {panelContent}
      </Box>
    </Slide>
  );
};

export default FriendDetailPanel;
