import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { VisibilityOff, Settings } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * AllSectionsHiddenCard - Reusable component displayed when all sections are hidden
 *
 * Props:
 * - title: Main heading text (default: "All Sections Hidden")
 * - message: Description message (default: "You've hidden all sections...")
 * - icon: Custom icon component (default: VisibilityOff)
 * - onCustomize: Callback to open customization modal (optional)
 * - customizeButtonLabel: Label for customize button (default: "Customize Layout")
 * - height: Container height (default: 300)
 * - showCustomizeButton: Whether to show the customize button (default: true)
 */
export default function AllSectionsHiddenCard({
  title = "All Sections Hidden",
  message = "You've hidden all sections from this view. Use the customization options to restore them.",
  icon: IconComponent = VisibilityOff,
  onCustomize,
  customizeButtonLabel = "Customize Layout",
  height = 300,
  showCustomizeButton = true,
}) {
  const { colors, isDark } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height,
        minHeight: 200,
        backgroundColor: colors.tertiary_bg,
        borderRadius: "12px",
        border: `1px dashed ${colors.border_color}`,
        padding: { xs: 3, sm: 4 },
        textAlign: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <IconComponent
          sx={{
            fontSize: 32,
            color: colors.secondary_text,
            opacity: 0.7,
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: colors.primary_text,
          fontWeight: 600,
          fontSize: { xs: "1rem", sm: "1.25rem" },
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: colors.secondary_text,
          maxWidth: 400,
          lineHeight: 1.6,
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
        }}
      >
        {message}
      </Typography>

      {showCustomizeButton && onCustomize && (
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={onCustomize}
          sx={{
            mt: 2,
            borderColor: colors.primary_accent,
            color: colors.primary_accent,
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: isDark
                ? "rgba(20, 184, 166, 0.1)"
                : "rgba(20, 184, 166, 0.08)",
            },
          }}
        >
          {customizeButtonLabel}
        </Button>
      )}
    </Box>
  );
}
