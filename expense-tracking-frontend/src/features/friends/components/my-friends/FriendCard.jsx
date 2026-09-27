import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useFeature } from "../../../../hooks/useFeature";
import { SUB_FEATURE_KEYS } from "../../../../config/featureCatalog";
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import { friendRowSx } from "../../utils/friendsSurfaceStyles";
import FriendAvatar from "../shared/FriendAvatar";

const FriendCard = ({ friend, onSelect, isSelected, onRemove, onBlock, onManageAccess }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const friendsEditEnabled = useFeature(SUB_FEATURE_KEYS.FRIENDS_EDIT);
  const friendsDeleteEnabled = useFeature(SUB_FEATURE_KEYS.FRIENDS_DELETE);
  const currentUserId = useCurrentUserId();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const display = resolveFriendDisplay(friend, {
    currentUserId,
    unknownLabel: t("friends.unknownUser"),
  });
  const accessOpt = ACCESS_LEVEL_OPTIONS.find((o) => o.value === display.accessLevel);
  const friendsSince = friend.createdAt
    ? new Date(friend.createdAt).toLocaleDateString()
    : "";

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={display.displayName}
      onClick={() => onSelect?.(friend)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(friend);
        }
      }}
      sx={friendRowSx(colors, { selected: isSelected })}
    >
      <FriendAvatar display={display} user={display.user} size={44} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "var(--color-primary-text)" }}
          noWrap
        >
          {display.displayName}
        </Typography>
        {display.email && (
          <Typography variant="caption" sx={{ color: "var(--color-secondary-text)" }} noWrap>
            {display.email}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
          <Chip
            size="small"
            label={t(accessOpt?.labelKey || "friends.accessLevels.none")}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: `${colors.primary_accent}20`,
              color: "var(--color-primary-accent)",
            }}
          />
          {friendsSince && (
            <Typography variant="caption" sx={{ color: "var(--color-secondary-text)" }}>
              {t("friends.detail.friendSince", { date: friendsSince })}
            </Typography>
          )}
        </Box>
      </Box>
      <IconButton
        size="small"
        aria-label={t("friends.actions.manageAccess")}
        onClick={handleMenuOpen}
        sx={{ color: "var(--color-secondary-text)", minWidth: 44, minHeight: 44 }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: colors.card_bg,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        {friendsDeleteEnabled && (
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onRemove?.(friend); }}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" sx={{ color: "var(--color-error)" }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.removeFriend")} />
        </MenuItem>
        )}
        {friendsEditEnabled && (
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onBlock?.(friend); }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" sx={{ color: "var(--color-error)" }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.blockUser")} />
        </MenuItem>
        )}
        {friendsEditEnabled && (
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onManageAccess?.(friend); }}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" sx={{ color: "var(--color-primary-accent)" }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.manageAccess")} />
        </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default FriendCard;
