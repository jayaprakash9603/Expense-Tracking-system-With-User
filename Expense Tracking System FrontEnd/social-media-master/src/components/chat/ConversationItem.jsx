import React from "react";
import { Avatar, Badge, Box, Typography } from "@mui/material";
import {
  formatMessageTime,
  getInitials,
  getAvatarColor,
  truncateMessage,
} from "../../utils/chatUtils";

function ConversationItem({
  conversation,
  isActive,
  isOnline,
  isTyping,
  onClick,
}) {
  const {
    friendId,
    friendName,
    friendImage,
    lastMessage,
    lastMessageTime,
    unreadCount,
  } = conversation;

  return (
    <Box
      onClick={() => onClick(conversation)}
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        cursor: "pointer",
        backgroundColor: isActive ? "#2a3942" : "transparent",
        "&:hover": {
          backgroundColor: isActive ? "#2a3942" : "#202c33",
        },
        borderBottom: "1px solid #222d34",
      }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: isOnline ? "#31a24c" : "#8696a0",
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "2px solid #111b21",
          },
        }}
      >
        <Avatar
          src={friendImage}
          sx={{
            width: 49,
            height: 49,
            backgroundColor: getAvatarColor(friendId),
            fontSize: "1.1rem",
          }}
        >
          {getInitials(friendName)}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, marginLeft: "15px", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "#e9edef",
              fontSize: "17px",
              fontWeight: unreadCount > 0 ? 600 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {friendName}
          </Typography>
          <Typography
            sx={{
              color: unreadCount > 0 ? "#00a884" : "#8696a0",
              fontSize: "12px",
              flexShrink: 0,
              marginLeft: "6px",
            }}
          >
            {formatMessageTime(lastMessageTime)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "2px",
          }}
        >
          <Typography
            sx={{
              color: isTyping ? "#00a884" : "#8696a0",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontStyle: isTyping ? "italic" : "normal",
            }}
          >
            {isTyping ? "typing..." : truncateMessage(lastMessage, 40)}
          </Typography>

          {unreadCount > 0 && (
            <Box
              sx={{
                backgroundColor: "#00a884",
                borderRadius: "50%",
                minWidth: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "6px",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ color: "#111b21", fontSize: "12px", fontWeight: 600 }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ConversationItem;
