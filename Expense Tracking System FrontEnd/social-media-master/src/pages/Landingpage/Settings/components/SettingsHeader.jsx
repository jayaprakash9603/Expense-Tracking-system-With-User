import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

/**
 * SettingsHeader Component
 * Dedicated header component for Settings page
 * Follows Single Responsibility Principle
 */
const SettingsHeader = ({ colors, isSmallScreen, onBack }) => {
  return (
    <Box
      sx={{
        backgroundColor: colors.tertiary_bg,
        borderBottom: `1px solid ${colors.border_color}`,
        p: isSmallScreen ? 2 : 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <IconButton
          onClick={onBack}
          sx={{
            color: colors.secondary_text,
            backgroundColor: colors.secondary_bg,
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: colors.hover_bg,
              color: colors.primary_accent,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            sx={{
              color: colors.primary_text,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary_text,
              fontSize: "0.85rem",
            }}
          >
            Manage your preferences and account settings
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsHeader;
