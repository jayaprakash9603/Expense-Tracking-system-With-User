import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { debounce } from "../../utils/chatUtils";

function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyTo,
  onCancelReply,
  disabled,
}) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (onTypingStart) onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onTypingStop) onTypingStop();
    }, 2000);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    const replyToId = replyTo?.id || null;
    onSendMessage(message.trim(), replyToId);
    setMessage("");

    if (isTyping) {
      setIsTyping(false);
      if (onTypingStop) onTypingStop();
    }

    if (onCancelReply) {
      onCancelReply();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ backgroundColor: "#202c33", padding: "10px 16px" }}>
      {replyTo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#1f2c33",
            borderRadius: "8px 8px 0 0",
            padding: "8px 12px",
            marginBottom: "-4px",
            borderLeft: "4px solid #00a884",
          }}
        >
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography
              sx={{ color: "#00a884", fontSize: "13px", fontWeight: 500 }}
            >
              {replyTo.senderName || "Reply to message"}
            </Typography>
            <Typography
              sx={{
                color: "#8696a0",
                fontSize: "13px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {replyTo.content}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onCancelReply}
            sx={{ color: "#8696a0" }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
        <IconButton sx={{ color: "#8696a0", padding: "10px" }}>
          <EmojiEmotionsOutlinedIcon />
        </IconButton>

        <IconButton sx={{ color: "#8696a0", padding: "10px" }}>
          <AttachFileIcon sx={{ transform: "rotate(45deg)" }} />
        </IconButton>

        <TextField
          inputRef={inputRef}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          multiline
          maxRows={5}
          fullWidth
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a3942",
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& textarea": {
                color: "#e9edef",
                padding: "9px 12px",
                fontSize: "15px",
                "&::placeholder": { color: "#8696a0", opacity: 1 },
              },
            },
          }}
        />

        {message.trim() ? (
          <IconButton
            onClick={handleSend}
            disabled={disabled}
            sx={{
              color: "#00a884",
              padding: "10px",
              "&:hover": { backgroundColor: "rgba(0,168,132,0.1)" },
            }}
          >
            <SendIcon />
          </IconButton>
        ) : (
          <IconButton sx={{ color: "#8696a0", padding: "10px" }}>
            <MicIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default ChatInput;
