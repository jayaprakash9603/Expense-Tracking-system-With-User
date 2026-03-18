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
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";
import FriendAvatar from "../shared/FriendAvatar";

const FriendCard = ({ friend, onSelect, isSelected, onRemove, onBlock, onManageAccess }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const displayName = [friend.firstName, friend.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || friend.name || "?";
  const userForAvatar = {
    firstName: friend.firstName,
    lastName: friend.lastName,
    profilePicture: friend.profilePicture,
  };
  const accessOpt = ACCESS_LEVEL_OPTIONS.find((o) => o.value === friend.accessLevel);
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
      onClick={() => onSelect?.(friend)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        mb: 1,
        bgcolor: colors.card_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: 2,
        cursor: "pointer",
        borderLeft: isSelected ? `3px solid ${colors.primary_accent}` : "3px solid transparent",
        "&:hover": { bgcolor: colors.hover_bg },
      }}
    >
      <FriendAvatar user={userForAvatar} size={44} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: colors.primary_text }}
          noWrap
        >
          {displayName}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <Chip
            size="small"
            label={t(accessOpt?.labelKey || "friends.accessLevels.none")}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: `${colors.primary_accent}20`,
              color: colors.primary_accent,
              border: `1px solid ${colors.primary_accent}40`,
            }}
          />
          {friendsSince && (
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text }}
            >
              {t("friends.friendsSince")} {friendsSince}
            </Typography>
          )}
        </Box>
      </Box>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{ color: colors.secondary_text }}
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
            border: `1px solid ${colors.border_color}`,
          },
        }}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onRemove?.(friend); }}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.removeFriend")} />
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onBlock?.(friend); }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.blockUser")} />
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onManageAccess?.(friend); }}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" sx={{ color: colors.primary_accent }} />
          </ListItemIcon>
          <ListItemText primary={t("friends.actions.manageAccess")} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FriendCard;
