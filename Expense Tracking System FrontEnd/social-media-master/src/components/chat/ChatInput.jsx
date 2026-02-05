import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { debounce } from "../../utils/chatUtils";
import { useTheme } from "../../hooks/useTheme";

function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyTo,
  onCancelReply,
  disabled,
}) {
  const { colors } = useTheme();
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
    <Box sx={{ backgroundColor: colors.primary_bg, padding: "10px 16px" }}>
      {replyTo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: colors.secondary_bg,
            borderRadius: "8px 8px 0 0",
            padding: "8px 12px",
            marginBottom: "-4px",
            borderLeft: `4px solid ${colors.primary_accent}`,
          }}
        >
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography
              sx={{
                color: colors.primary_accent,
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {replyTo.senderName || "Reply to message"}
            </Typography>
            <Typography
              sx={{
                color: colors.secondary_text,
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
            sx={{ color: colors.secondary_text }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
        <IconButton sx={{ color: colors.secondary_text, padding: "10px" }}>
          <EmojiEmotionsOutlinedIcon />
        </IconButton>

        <IconButton sx={{ color: colors.secondary_text, padding: "10px" }}>
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
              backgroundColor: colors.input_bg,
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& textarea": {
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

        {message.trim() ? (
          <IconButton
            onClick={handleSend}
            disabled={disabled}
            sx={{
              color: colors.primary_accent,
              padding: "10px",
              "&:hover": { backgroundColor: `${colors.primary_accent}1A` },
            }}
          >
            <SendIcon />
          </IconButton>
        ) : (
          <IconButton sx={{ color: colors.secondary_text, padding: "10px" }}>
            <MicIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default ChatInput;
