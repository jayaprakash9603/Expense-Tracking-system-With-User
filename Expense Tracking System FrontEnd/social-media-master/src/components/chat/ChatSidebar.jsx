import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ConversationItem from "./ConversationItem";
import {
  sortConversationsByTime,
  getInitials,
  getAvatarColor,
} from "../../utils/chatUtils";
import { fetchFriends } from "../../Redux/Friends/friendsActions";
import { useTheme } from "../../hooks/useTheme";

function ChatSidebar({
  conversations,
  activeConversation,
  onlineUsers,
  typingUsers,
  loading,
  onSelectConversation,
  onBack,
  currentUser,
}) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { friends, loadingFriends } = useSelector((state) => state.friends);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const existingConversationFriendIds = useMemo(() => {
    return new Set(conversations.map((conv) => conv.friendId));
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const sorted = sortConversationsByTime(conversations);
    if (!searchQuery.trim()) return sorted;

    return sorted.filter((conv) =>
      conv.friendName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [conversations, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return friends.filter((friend) => {
      const friendId = friend.friendId || friend.id;
      const hasExistingConversation =
        existingConversationFriendIds.has(friendId);
      if (hasExistingConversation) return false;

      const friendName =
        friend.friendName || friend.firstName + " " + friend.lastName || "";
      return friendName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [friends, searchQuery, existingConversationFriendIds]);

  const handleFriendClick = (friend) => {
    const newConversation = {
      friendId: friend.friendId || friend.id,
      friendName:
        friend.friendName ||
        `${friend.firstName || ""} ${friend.lastName || ""}`.trim(),
      friendImage: friend.friendImage || friend.image || friend.profileImage,
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0,
      isNewConversation: true,
    };
    onSelectConversation(newConversation);
    setSearchQuery("");
  };

  return (
    <Box
      sx={{
        width: "30%",
        minWidth: 300,
        maxWidth: 440,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.secondary_bg,
        borderRight: `1px solid ${colors.border_color}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          backgroundColor: colors.primary_bg,
          height: 59,
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{ color: colors.secondary_text, marginRight: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          sx={{ color: colors.primary_text, fontSize: "19px", fontWeight: 500 }}
        >
          Chats
        </Typography>
      </Box>

      <Box sx={{ padding: "8px 12px", backgroundColor: colors.secondary_bg }}>
        <TextField
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.secondary_text }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors.primary_bg,
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& input": {
                color: colors.primary_text,
                padding: "9px 12px",
                fontSize: "15px",
                "&::placeholder": {
                  color: colors.placeholder_text,
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.border_color,
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: colors.secondary_text,
            },
          },
        }}
      >
        {loading || loadingFriends ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress sx={{ color: colors.primary_accent }} />
          </Box>
        ) : (
          <>
            {searchQuery.trim() && filteredFriends.length > 0 && (
              <>
                <Box
                  sx={{
                    padding: "8px 16px",
                    backgroundColor: colors.secondary_bg,
                  }}
                >
                  <Typography
                    sx={{
                      color: colors.primary_accent,
                      fontSize: "13px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 16 }} />
                    Start new chat
                  </Typography>
                </Box>
                {filteredFriends.map((friend) => {
                  const friendId = friend.friendId || friend.id;
                  const friendName =
                    friend.friendName ||
                    `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
                  const friendImage =
                    friend.friendImage || friend.image || friend.profileImage;
                  return (
                    <Box
                      key={`friend-${friendId}`}
                      onClick={() => handleFriendClick(friend)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        "&:hover": { backgroundColor: colors.primary_bg },
                        borderBottom: `1px solid ${colors.border_color}`,
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
                      <Box sx={{ flex: 1, marginLeft: "15px" }}>
                        <Typography
                          sx={{ color: colors.primary_text, fontSize: "17px" }}
                        >
                          {friendName}
                        </Typography>
                        <Typography
                          sx={{
                            color: colors.secondary_text,
                            fontSize: "13px",
                          }}
                        >
                          Click to start chatting
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                {filteredConversations.length > 0 && (
                  <Box
                    sx={{
                      padding: "8px 16px",
                      backgroundColor: colors.secondary_bg,
                      marginTop: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: colors.secondary_text,
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Recent chats
                    </Typography>
                  </Box>
                )}
              </>
            )}
            {filteredConversations.length === 0 &&
            filteredFriends.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  padding: "20px",
                }}
              >
                <Typography
                  sx={{
                    color: colors.secondary_text,
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {searchQuery
                    ? "No friends or conversations found"
                    : "No conversations yet. Start chatting with your friends!"}
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.friendId || conversation.id}
                  conversation={conversation}
                  isActive={
                    activeConversation?.friendId === conversation.friendId
                  }
                  isOnline={onlineUsers[conversation.friendId]}
                  isTyping={typingUsers[conversation.friendId]}
                  onClick={onSelectConversation}
                />
              ))
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default ChatSidebar;
