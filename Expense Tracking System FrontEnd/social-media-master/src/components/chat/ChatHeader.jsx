import React from "react";
import { Avatar, Badge, Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import VideocamIcon from "@mui/icons-material/Videocam";
import CallIcon from "@mui/icons-material/Call";
import {
  formatLastSeen,
  getInitials,
  getAvatarColor,
} from "../../utils/chatUtils";
import { useTheme } from "../../hooks/useTheme";

function ChatHeader({
  conversation,
  isOnline,
  isTyping,
  lastSeen,
  onBack,
  onMenuClick,
}) {
  const { colors } = useTheme();

  if (!conversation) return null;

  const { friendId, friendName, friendImage } = conversation;

  const getStatusText = () => {
    if (isTyping) return "typing...";
    if (isOnline) return "online";
    if (lastSeen) return `last seen ${formatLastSeen(lastSeen)}`;
    return "offline";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: colors.primary_bg,
        height: 59,
        borderBottom: `1px solid ${colors.border_color}`,
      }}
    >
      <IconButton
        onClick={onBack}
        sx={{
          color: colors.secondary_text,
          marginRight: 1,
          display: { xs: "flex", md: "none" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: isOnline ? "#31a24c" : "transparent",
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: isOnline ? `2px solid ${colors.primary_bg}` : "none",
          },
        }}
      >
        <Avatar
          src={friendImage}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: getAvatarColor(friendId),
            cursor: "pointer",
          }}
        >
          {getInitials(friendName)}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, marginLeft: "15px", overflow: "hidden" }}>
        <Typography
          sx={{
            color: colors.primary_text,
            fontSize: "16px",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {friendName}
        </Typography>
        <Typography
          sx={{
            color: isTyping ? colors.primary_accent : colors.secondary_text,
            fontSize: "13px",
            fontStyle: isTyping ? "italic" : "normal",
          }}
        >
          {getStatusText()}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton sx={{ color: colors.secondary_text }}>
          <VideocamIcon />
        </IconButton>
        <IconButton sx={{ color: colors.secondary_text }}>
          <CallIcon />
        </IconButton>
        <IconButton sx={{ color: colors.secondary_text }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={onMenuClick} sx={{ color: colors.secondary_text }}>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatHeader;
