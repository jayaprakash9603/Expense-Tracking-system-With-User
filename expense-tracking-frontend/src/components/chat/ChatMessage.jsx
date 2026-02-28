import React, { useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplyIcon from "@mui/icons-material/Reply";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ForwardIcon from "@mui/icons-material/Forward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  formatMessageTime,
  getInitials,
  getAvatarColor,
  getReactionEmoji,
} from "../../utils/chatUtils";
import EmojiReactionPicker from "./EmojiReactionPicker";
import { useTheme } from "../../hooks/useTheme";

function ChatMessage({
  message,
  isOwn,
  showAvatar,
  senderName,
  senderImage,
  senderId,
  onReply,
  onReaction,
  onForward,
  onDelete,
  isOneToOneChat = true, // Default to true since most chats are one-to-one
}) {
  const { mode, colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Theme-aware message bubble colors
  const ownMessageBg = mode === "dark" ? "#005c4b" : colors.primary_accent;
  const otherMessageBg = colors.primary_bg;
  const replyBgOwn = mode === "dark" ? "#025144" : `${colors.primary_accent}CC`;
  const replyBgOther = colors.secondary_bg;

  const {
    id,
    content,
    timestamp,
    createdAt,
    status,
    reactions,
    replyTo,
    readBy,
    pending,
    isDelivered: msgIsDelivered,
    isRead: msgIsRead,
  } = message;

  const messageTime = timestamp || createdAt;
  // Check both the boolean fields from backend AND the status string
  const isDelivered =
    msgIsDelivered === true || status === "DELIVERED" || status === "READ";
  const isRead =
    msgIsRead === true || status === "READ" || (readBy && readBy.length > 0);

  const handleReactionClick = (event) => {
    setReactionAnchor(event.currentTarget);
  };

  const handleReactionClose = () => {
    setReactionAnchor(null);
  };

  const handleReactionSelect = (reaction) => {
    if (onReaction) {
      onReaction(id, reaction);
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleForward = () => {
    if (onForward) {
      onForward(message);
    }
    handleMenuClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        marginBottom: "2px",
        padding: "0 63px",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Only show avatar in group chats, not in one-to-one chats */}
      {!isOneToOneChat && !isOwn && showAvatar && (
        <Avatar
          src={senderImage}
          sx={{
            width: 28,
            height: 28,
            marginRight: "8px",
            marginBottom: "4px",
            backgroundColor: getAvatarColor(senderId),
            fontSize: "0.75rem",
          }}
        >
          {getInitials(senderName)}
        </Avatar>
      )}

      {/* Spacer for consistent alignment in group chats */}
      {!isOneToOneChat && !isOwn && !showAvatar && <Box sx={{ width: 36 }} />}

      <Box sx={{ maxWidth: "65%", position: "relative" }}>
        {replyTo && (
          <Box
            sx={{
              backgroundColor: isOwn ? replyBgOwn : replyBgOther,
              borderRadius: "7.5px 7.5px 0 0",
              padding: "8px 12px 4px",
              borderLeft: `4px solid ${colors.primary_accent}`,
              marginBottom: "-4px",
            }}
          >
            <Typography
              sx={{
                color: colors.primary_accent,
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              {replyTo.senderName || "Reply"}
            </Typography>
            <Typography
              sx={{
                color: colors.secondary_text,
                fontSize: "13px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              {replyTo.content}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            backgroundColor: isOwn ? ownMessageBg : otherMessageBg,
            borderRadius: replyTo
              ? "0 0 7.5px 7.5px"
              : isOwn
                ? "7.5px 7.5px 0 7.5px"
                : "7.5px 7.5px 7.5px 0",
            padding: "6px 7px 8px 9px",
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Typography
              sx={{
                color: isOwn ? "#ffffff" : colors.primary_text,
                fontSize: "14.2px",
                lineHeight: 1.35,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {content}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: "12px",
                flexShrink: 0,
                alignSelf: "flex-end",
                marginBottom: "-3px",
              }}
            >
              <Typography
                sx={{
                  color: isOwn
                    ? "rgba(255,255,255,0.6)"
                    : colors.secondary_text,
                  fontSize: "11px",
                  marginRight: "3px",
                }}
              >
                {formatMessageTime(messageTime)}
              </Typography>
              {isOwn && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "2px",
                  }}
                >
                  {pending ? (
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
                    />
                  ) : isRead ? (
                    <DoneAllIcon sx={{ fontSize: 16, color: "#53bdeb" }} />
                  ) : isDelivered ? (
                    <DoneAllIcon
                      sx={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}
                    />
                  ) : (
                    <DoneIcon
                      sx={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {reactions && Object.keys(reactions).length > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: -10,
                right: isOwn ? "auto" : 8,
                left: isOwn ? 8 : "auto",
                backgroundColor: colors.secondary_bg,
                borderRadius: "12px",
                padding: "2px 6px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {Object.entries(reactions).map(([reaction, users]) => (
                <Typography
                  key={reaction}
                  sx={{ fontSize: "14px", marginRight: "2px" }}
                >
                  {getReactionEmoji(reaction)}
                  {users.length > 1 && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "11px",
                        color: colors.secondary_text,
                        marginLeft: "2px",
                      }}
                    >
                      {users.length}
                    </Typography>
                  )}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {hovered && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              [isOwn ? "left" : "right"]: -80,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor: colors.primary_bg,
              borderRadius: "6px",
              padding: "2px 4px",
            }}
          >
            <IconButton
              size="small"
              onClick={handleReactionClick}
              sx={{ color: colors.secondary_text, padding: "4px" }}
            >
              <AddReactionOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onReply && onReply(message)}
              sx={{ color: colors.secondary_text, padding: "4px" }}
            >
              <ReplyIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleForward}
              sx={{ color: colors.secondary_text, padding: "4px" }}
            >
              <ForwardIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ color: colors.secondary_text, padding: "4px" }}
            >
              <ExpandMoreIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      <EmojiReactionPicker
        anchorEl={reactionAnchor}
        open={Boolean(reactionAnchor)}
        onClose={handleReactionClose}
        onSelect={handleReactionSelect}
      />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: colors.card_bg,
            color: colors.primary_text,
            minWidth: 180,
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          },
        }}
      >
        <MenuItem
          onClick={() => onReply && onReply(message)}
          sx={{ "&:hover": { backgroundColor: colors.hover_bg } }}
        >
          <ListItemIcon>
            <ReplyIcon sx={{ color: colors.secondary_text, fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Reply</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleForward}
          sx={{ "&:hover": { backgroundColor: colors.hover_bg } }}
        >
          <ListItemIcon>
            <ForwardIcon sx={{ color: colors.secondary_text, fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Forward</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleCopyText}
          sx={{ "&:hover": { backgroundColor: colors.hover_bg } }}
        >
          <ListItemIcon>
            <ContentCopyIcon
              sx={{ color: colors.secondary_text, fontSize: 20 }}
            />
          </ListItemIcon>
          <ListItemText>Copy text</ListItemText>
        </MenuItem>
        {isOwn && (
          <MenuItem
            onClick={handleDelete}
            sx={{ "&:hover": { backgroundColor: colors.hover_bg } }}
          >
            <ListItemIcon>
              <DeleteOutlineIcon sx={{ color: "#f15c6d", fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "#f15c6d" }}>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default ChatMessage;
