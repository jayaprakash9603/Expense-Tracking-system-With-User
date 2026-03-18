import React from "react";
import { Box, Typography } from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";

const FriendsEmptyState = ({ section, icon }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const title = t(`friends.empty.${section}`);
  const subtitle = t(`friends.empty.${section}Desc`);
  const iconSx = { fontSize: 64, color: colors.border_color };
  const iconEl = icon
    ? React.cloneElement(icon, { sx: { ...iconSx, ...icon.props?.sx } })
    : <PersonOffIcon sx={iconSx} />;

  return (
    <Box
      sx={{
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      {iconEl}
      <Typography
        variant="h6"
        sx={{ color: colors.secondary_text, fontWeight: 500 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.secondary_text }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default FriendsEmptyState;
