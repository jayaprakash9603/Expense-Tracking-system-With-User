import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * DateIndicator Component
 *
 * A reusable component for displaying date indicators with badges and animations
 *
 * @param {string} type - Type of indicator: 'today' or 'salary'
 * @param {string} position - Position of the badge: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 * @param {boolean} showAnimation - Whether to show the pulsing animation (default: true)
 * @param {boolean} showCornerAccent - Whether to show the corner triangular accent (default: true)
 * @param {boolean} showBadge - Whether to show the text badge (default: true)
 * @param {string} customBadgeText - Custom text for the badge (optional)
 * @param {object} customColors - Custom color scheme { primary, secondary, accent } (optional)
 */
const DateIndicator = ({
  type = "today",
  position = "top-left",
  showAnimation = true,
  showCornerAccent = true,
  showBadge = true,
  customBadgeText = null,
  customColors = null,
}) => {
  // Default color schemes for different types
  const colorSchemes = {
    today: {
      primary: "#00dac6",
      secondary: "#00a89b",
      accent: "rgba(0, 218, 198, 0.3)",
      text: "TODAY",
    },
    salary: {
      primary: "#22c55e",
      secondary: "#16a34a",
      accent: "rgba(34, 197, 94, 0.3)",
      text: "₹ SALARY",
      icon: "₹",
    },
  };

  const colors = customColors || colorSchemes[type] || colorSchemes.today;
  const badgeText = customBadgeText || colors.text;

  // Position configurations
  const positionConfig = {
    "top-left": {
      badge: { top: -8, left: -2 },
      animation: { top: 2, left: 2 },
      corner: {
        top: 0,
        left: 0,
        borderLeft: `16px solid ${colors.primary}`,
        borderBottom: "16px solid transparent",
        borderTopLeftRadius: 8,
      },
    },
    "top-right": {
      badge: { top: -8, right: -2 },
      animation: { top: 2, right: 2 },
      corner: {
        top: 0,
        right: 0,
        borderRight: `16px solid ${colors.primary}`,
        borderBottom: "16px solid transparent",
        borderTopRightRadius: 8,
      },
    },
    "bottom-left": {
      badge: { bottom: -8, left: -2 },
      animation: { bottom: 2, left: 2 },
      corner: {
        bottom: 0,
        left: 0,
        borderLeft: `16px solid ${colors.primary}`,
        borderTop: "16px solid transparent",
        borderBottomLeftRadius: 8,
      },
    },
    "bottom-right": {
      badge: { bottom: -8, right: -2 },
      animation: { bottom: 2, right: 2 },
      corner: {
        bottom: 0,
        right: 0,
        borderRight: `16px solid ${colors.primary}`,
        borderTop: "16px solid transparent",
        borderBottomRightRadius: 8,
      },
    },
  };

  const config = positionConfig[position] || positionConfig["top-left"];

  return (
    <>
      {/* Animated pulse/shimmer effect */}
      {showAnimation && (
        <Box
          sx={{
            position: "absolute",
            ...config.animation,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: colors.accent,
            zIndex: 10,
            animation: `${type}Pulse 2s ease-in-out infinite`,
            [`@keyframes ${type}Pulse`]: {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 0.3,
              },
              "50%": {
                transform: "scale(1.5)",
                opacity: 0,
              },
            },
          }}
        />
      )}

      {/* Badge */}
      {showBadge && (
        <Box
          sx={{
            position: "absolute",
            ...config.badge,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            color: "#fff",
            fontSize: "8px",
            fontWeight: 700,
            px: 1,
            py: 0.3,
            borderRadius: "8px",
            zIndex: 11,
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          {type === "salary" && colors.icon && (
            <Typography
              sx={{
                fontSize: "8px",
                fontWeight: 700,
              }}
            >
              {colors.icon}
            </Typography>
          )}
          {badgeText}
        </Box>
      )}

      {/* Corner accent */}
      {showCornerAccent && (
        <Box
          sx={{
            position: "absolute",
            ...config.corner,
            width: 0,
            height: 0,
            opacity: 0.6,
            zIndex: 9,
          }}
        />
      )}
    </>
  );
};

export default DateIndicator;
