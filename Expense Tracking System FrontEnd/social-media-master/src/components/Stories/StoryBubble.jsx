/**
 * StoryBubble Component
 * Individual story indicator bubble with colored ring
 * Shows story type icon and status
 */
import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import {
  AccountBalance,
  Receipt,
  TrendingUp,
  Warning,
  EmojiEvents,
  Lightbulb,
  Campaign,
  CalendarToday,
  Savings,
  CardGiftcard,
  Info,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

// Map story types to icons
const storyTypeIcons = {
  BUDGET_THRESHOLD_80: AccountBalance,
  BUDGET_THRESHOLD_90: AccountBalance,
  BUDGET_THRESHOLD_100: Warning,
  BILL_REMINDER: Receipt,
  BILL_OVERDUE: Receipt,
  EXPENSE_SPIKE: TrendingUp,
  WEEKLY_SUMMARY: CalendarToday,
  MONTHLY_SUMMARY: CalendarToday,
  ACHIEVEMENT: EmojiEvents,
  SAVINGS_GOAL: Savings,
  TIP: Lightbulb,
  PROMOTION: CardGiftcard,
  SYSTEM_UPDATE: Campaign,
  ANNOUNCEMENT: Campaign,
  CUSTOM: Info,
};

// Map severity to colors
const severityColors = {
  INFO: "#2196f3",
  SUCCESS: "#4caf50",
  WARNING: "#ff9800",
  CRITICAL: "#f44336",
};

const StoryBubble = ({ story, onClick }) => {
  const { colors } = useTheme();

  const IconComponent = storyTypeIcons[story.storyType] || Info;
  const ringColor =
    story.severityColor || severityColors[story.severity] || colors.primary;

  // Get display title (shortened for bubble)
  const displayTitle =
    story.storyType
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .substring(0, 12) || "Update";

  return (
    <Tooltip title={story.title} arrow placement="bottom">
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          minWidth: 64,
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        {/* Ring Container */}
        <Box
          sx={{
            position: "relative",
            width: 60,
            height: 60,
            borderRadius: "50%",
            padding: "3px",
            background: story.seen
              ? colors.border || "#e0e0e0"
              : `linear-gradient(45deg, ${ringColor}, ${adjustColor(ringColor, 30)})`,
            boxShadow: story.seen ? "none" : `0 2px 8px ${ringColor}40`,
          }}
        >
          {/* Inner Circle */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: story.backgroundColor || colors.cardBackground,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.cardBackground}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Gradient */}
            {story.backgroundGradient && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: story.backgroundGradient,
                  opacity: 0.3,
                }}
              />
            )}

            {/* Icon */}
            <IconComponent
              sx={{
                fontSize: 24,
                color: ringColor,
                zIndex: 1,
              }}
            />
          </Box>

          {/* Unseen Indicator Dot */}
          {!story.seen && (
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: ringColor,
                border: `2px solid ${colors.cardBackground}`,
              }}
            />
          )}
        </Box>

        {/* Label */}
        <Typography
          variant="caption"
          sx={{
            color: story.seen ? colors.textSecondary : colors.textPrimary,
            fontSize: 10,
            fontWeight: story.seen ? 400 : 600,
            maxWidth: 64,
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayTitle}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  const clamp = (num) => Math.min(255, Math.max(0, num));

  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00ff) + amount);
    const b = clamp((num & 0x0000ff) + amount);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  return color;
}

export default StoryBubble;
