import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import {
  ChatSidebar,
  ChatHeader,
  ChatArea,
  ForwardMessageDialog,
} from "../../components/chat";
import { useTheme } from "../../hooks/useTheme";
import chatWebSocket from "../../services/chatWebSocket";

function FriendChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [replyTo, setReplyTo] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const { colors } = useTheme();

  const emptyStateSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 303 172'%3E%3Cpath fill='${encodeURIComponent(
    colors.primary_accent,
  )}' d='M151.5 72.5C97.7 72.5 54 116.2 54 170c0 7.8.9 15.4 2.7 22.7L0 235l43.8-56.4c16.8 10.5 36.7 16.5 58.2 16.5 53.8 0 97.5-43.7 97.5-97.5S205.3 0 151.5 0 54 43.7 54 97.5'/%3E%3C/svg%3E")`;

  const {
    user,
    conversations,
    conversationsLoading,
    activeConversation,
    currentMessages,
    loading,
    typingUsers,
    onlineUsers,
    lastSeenMap,
    isConversationTyping,
    isConversationOnline,
    conversationLastSeen,
    selectConversation,
    closeConversation,
    sendMessage,
    startTyping,
    stopTyping,
    sendReaction,
  } = useChat();

  useEffect(() => {
    const state = location.state;
    if (state?.friendId && state?.friendName) {
      const friendConversation = {
        friendId: state.friendId,
        friendName: state.friendName,
        friendImage: state.friendImage || null,
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
      };
      selectConversation(friendConversation);
    }
  }, [location.state, selectConversation]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSelectConversation = useCallback(
    (conversation) => {
      selectConversation(conversation);
    },
    [selectConversation],
  );

  const handleSendMessage = useCallback(
    (content, replyToId) => {
      sendMessage(content, replyToId);
      setReplyTo(null);
    },
    [sendMessage],
  );

  const handleReply = useCallback((message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: message.sender?.firstName
        ? `${message.sender.firstName} ${message.sender.lastName || ""}`
        : "Message",
    });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleForward = useCallback((message) => {
    setForwardMessage(message);
  }, []);

  const handleForwardSubmit = useCallback((messageId, recipientIds) => {
    chatWebSocket.forwardMessage(messageId, recipientIds);
    setForwardMessage(null);
  }, []);

  const handleCloseForwardDialog = useCallback(() => {
    setForwardMessage(null);
  }, []);

  const handleMenuClick = useCallback(() => {}, []);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        backgroundColor: "#111b21",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1300,
      }}
    >
      <ChatSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        loading={conversationsLoading}
        onSelectConversation={handleSelectConversation}
        onBack={handleBack}
        currentUser={user}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              isOnline={isConversationOnline}
              isTyping={isConversationTyping}
              lastSeen={conversationLastSeen}
              onBack={closeConversation}
              onMenuClick={handleMenuClick}
            />
            <ChatArea
              messages={currentMessages}
              loading={loading}
              currentUserId={user?.id}
              isTyping={isConversationTyping}
              replyTo={replyTo}
              onSendMessage={handleSendMessage}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
              onReply={handleReply}
              onReaction={sendReaction}
              onCancelReply={handleCancelReply}
              onForward={handleForward}
            />
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.secondary_bg,
              borderBottom: `6px solid ${colors.primary_accent}`,
            }}
          >
            <Box
              sx={{
                width: 360,
                height: 360,
                backgroundImage: emptyStateSvg,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                opacity: 0.25,
                marginBottom: 40,
              }}
            />
            <Box
              sx={{
                textAlign: "center",
                color: colors.secondary_text,
                maxWidth: 500,
              }}
            >
              <Box
                component="h1"
                sx={{
                  fontSize: "32px",
                  fontWeight: 300,
                  color: colors.primary_text,
                  marginBottom: "16px",
                }}
              >
                Expensio Finance Chat
              </Box>
              <Box
                sx={{ fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}
              >
                Stay on top of expenses and conversations in one place.
                <br />
                Share updates, confirm payments, and keep your team aligned.
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <ForwardMessageDialog
        open={Boolean(forwardMessage)}
        onClose={handleCloseForwardDialog}
        onForward={handleForwardSubmit}
        friends={conversations.map((c) => ({
          id: c.friendId,
          firstName: c.friendName?.split(" ")[0] || "",
          lastName: c.friendName?.split(" ").slice(1).join(" ") || "",
          fullName: c.friendName,
          image: c.friendImage,
        }))}
        message={forwardMessage}
      />
    </Box>
  );
}

export default FriendChat;
