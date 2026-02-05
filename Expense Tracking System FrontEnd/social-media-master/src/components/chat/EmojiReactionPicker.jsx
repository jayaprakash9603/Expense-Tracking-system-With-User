import React from "react";
import { Box, IconButton, Popover } from "@mui/material";
import { REACTION_EMOJIS } from "../../utils/chatUtils";

function EmojiReactionPicker({ anchorEl, open, onClose, onSelect }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#233138",
          borderRadius: "24px",
          padding: "4px 8px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {REACTION_EMOJIS.map((reaction) => (
          <IconButton
            key={reaction.name}
            onClick={() => {
              onSelect(reaction.name);
              onClose();
            }}
            sx={{
              fontSize: "24px",
              padding: "8px",
              transition: "transform 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                transform: "scale(1.2)",
              },
            }}
          >
            {reaction.emoji}
          </IconButton>
        ))}
      </Box>
    </Popover>
  );
}

export default EmojiReactionPicker;
