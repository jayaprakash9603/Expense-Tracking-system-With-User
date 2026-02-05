import React, { useRef, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { groupMessagesByDate, formatChatDate } from "../../utils/chatUtils";

function ChatArea({
  messages,
  loading,
  currentUserId,
  isTyping,
  replyTo,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onReply,
  onReaction,
  onCancelReply,
  onForward,
  onDelete,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages],
  );

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const shouldShowAvatar = (message, index, dayMessages) => {
    if (index === 0) return true;
    const prevMessage = dayMessages[index - 1];
    const prevSenderId = prevMessage.sender?.id || prevMessage.senderId;
    const currentSenderId = message.sender?.id || message.senderId;
    return prevSenderId !== currentSenderId;
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#0b141a",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23091620' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px 0",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#00a884" }} />
          </Box>
        ) : messages.length === 0 ? (
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
            <Box
              sx={{
                backgroundColor: "#182229",
                borderRadius: "8px",
                padding: "16px 24px",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#e9edef",
                  fontSize: "14.5px",
                  marginBottom: "4px",
                }}
              >
                No messages yet
              </Typography>
              <Typography sx={{ color: "#8696a0", fontSize: "12.5px" }}>
                Send a message to start the conversation
              </Typography>
            </Box>
          </Box>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
            <Box key={dateKey}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#182229",
                    borderRadius: "8px",
                    padding: "5px 12px",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#8696a0",
                      fontSize: "12.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {formatChatDate(new Date(dateKey))}
                  </Typography>
                </Box>
              </Box>

              {dayMessages.map((message, index) => {
                const senderId = message.sender?.id || message.senderId;
                const isOwn = senderId === currentUserId;
                const senderName = message.sender?.firstName
                  ? `${message.sender.firstName} ${message.sender.lastName || ""}`
                  : message.senderName;

                return (
                  <ChatMessage
                    key={message.id || index}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={shouldShowAvatar(message, index, dayMessages)}
                    senderName={senderName}
                    senderImage={message.sender?.image}
                    senderId={senderId}
                    onReply={onReply}
                    onReaction={onReaction}
                    onForward={onForward}
                    onDelete={onDelete}
                  />
                );
              })}
            </Box>
          ))
        )}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </Box>

      <ChatInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
        disabled={loading}
      />
    </Box>
  );
}

export default ChatArea;
