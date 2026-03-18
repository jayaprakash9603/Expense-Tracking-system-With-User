import React from "react";
import { Avatar, Box } from "@mui/material";
import { useTheme } from "../../../../hooks/useTheme";

const FriendAvatar = ({
  user,
  size = 40,
  showOnline = false,
  onClick,
}) => {
  const { colors } = useTheme();
  const initial =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <Avatar
        src={user?.profilePicture}
        alt={initial}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          bgcolor: colors.primary_accent,
          color: "white",
          fontSize: size * 0.4,
          cursor: onClick ? "pointer" : "default",
        }}
      >
        {initial}
      </Avatar>
      {showOnline && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: "50%",
            bgcolor: colors.success,
            border: `2px solid ${colors.card_bg}`,
          }}
        />
      )}
    </Box>
  );
};

export default FriendAvatar;
