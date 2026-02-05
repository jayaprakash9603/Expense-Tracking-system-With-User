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

function ChatHeader({
  conversation,
  isOnline,
  isTyping,
  lastSeen,
  onBack,
  onMenuClick,
}) {
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
        backgroundColor: "#202c33",
        height: 59,
        borderBottom: "1px solid #222d34",
      }}
    >
      <IconButton
        onClick={onBack}
        sx={{
          color: "#aebac1",
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
            border: isOnline ? "2px solid #202c33" : "none",
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
            color: "#e9edef",
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
            color: isTyping ? "#00a884" : "#8696a0",
            fontSize: "13px",
            fontStyle: isTyping ? "italic" : "normal",
          }}
        >
          {getStatusText()}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton sx={{ color: "#aebac1" }}>
          <VideocamIcon />
        </IconButton>
        <IconButton sx={{ color: "#aebac1" }}>
          <CallIcon />
        </IconButton>
        <IconButton sx={{ color: "#aebac1" }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={onMenuClick} sx={{ color: "#aebac1" }}>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatHeader;
