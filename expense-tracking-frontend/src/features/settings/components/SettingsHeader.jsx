import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useTranslation } from "../../../hooks/useTranslation";

/**
 * SettingsHeader Component
 * Dedicated header component for Settings page
 * Follows Single Responsibility Principle
 * Supports custom title and subtitle for reusability
 */
const SettingsHeader = ({ colors, isSmallScreen, onBack, title, subtitle }) => {
  const { t } = useTranslation();
  const headerTitle = title || t("settings.title");
  const headerSubtitle = subtitle || t("settings.subtitle");
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
            color: "var(--color-secondary-text)",
            backgroundColor: "var(--color-secondary-bg)",
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "var(--color-hover-bg)",
              color: "var(--color-primary-accent)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            sx={{
              color: "var(--color-primary-text)",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            {headerTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "var(--color-secondary-text)",
              fontSize: "0.85rem",
            }}
          >
            {headerSubtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsHeader;
