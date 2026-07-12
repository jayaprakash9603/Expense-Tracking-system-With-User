import React from "react";
import { Avatar, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useTheme } from "../../../../hooks/useTheme";
import { useTranslation } from "../../../../hooks/useTranslation";
import {
  resolveDisplayName,
  resolveInitials,
  resolveProfileImage,
} from "../../utils/resolveFriendDisplay";

const FriendAvatar = ({
  user,
  display,
  size = 40,
  showOnline = false,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unknownLabel = t("friends.unknownUser");

  const profileImage = display?.profileImage ?? resolveProfileImage(user);
  const initials = display?.initials ?? resolveInitials(user);
  const name = display?.displayName ?? resolveDisplayName(user, unknownLabel);
  const showPersonIcon = !profileImage && !initials;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <Avatar
        src={profileImage || undefined}
        alt={name}
        aria-label={ariaLabel || name}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          bgcolor: showPersonIcon ? colors.secondary_bg : colors.primary_accent,
          color: showPersonIcon ? colors.secondary_text : "white",
          fontSize: size * 0.4,
          cursor: onClick ? "pointer" : "default",
          transition: "box-shadow 200ms ease, transform 200ms ease",
          "&:hover": onClick
            ? { boxShadow: `0 0 0 2px ${colors.primary_accent}40` }
            : undefined,
        }}
      >
        {showPersonIcon ? (
          <PersonIcon sx={{ fontSize: size * 0.55 }} />
        ) : (
          initials
        )}
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
