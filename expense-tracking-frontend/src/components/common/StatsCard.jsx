/**
 * =============================================================================
 * StatsCard - Reusable Statistics Card Component
 * =============================================================================
 *
 * A flexible statistics card for displaying metrics.
 * Supports different sizes, colors, and optional icons.
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Component
// =============================================================================

/**
 * StatsCard - Displays a statistic with optional trend indicator
 * @param {Object} props
 * @param {string} props.label - Label for the stat
 * @param {number|string} props.value - The main value to display
 * @param {string} props.color - Accent color (optional)
 * @param {React.ReactNode} props.icon - Icon component (optional)
 * @param {number} props.trend - Trend percentage (positive/negative)
 * @param {string} props.trendLabel - Label for the trend
 * @param {string} props.size - Size variant (small, medium, large)
 * @param {string} props.tooltip - Tooltip text
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.sx - Additional styles
 */
const StatsCard = ({
  label,
  value,
  color,
  icon,
  trend,
  trendLabel,
  size = "medium",
  tooltip,
  onClick,
  sx = {},
}) => {
  const { colors } = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      py: 1.5,
      valueVariant: "h5",
      labelVariant: "caption",
      iconSize: 32,
    },
    medium: {
      py: 2,
      valueVariant: "h4",
      labelVariant: "body2",
      iconSize: 40,
    },
    large: {
      py: 3,
      valueVariant: "h3",
      labelVariant: "body1",
      iconSize: 48,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const accentColor = color || colors.primary;

  const cardContent = (
    <Card
      sx={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: `0 4px 12px ${colors.shadow}`,
              borderColor: accentColor,
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          textAlign: "center",
          py: config.py,
          "&:last-child": { pb: config.py },
        }}
      >
        {/* Icon (optional) */}
        {icon && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Avatar
              sx={{
                width: config.iconSize,
                height: config.iconSize,
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        )}

        {/* Value */}
        <Typography
          variant={config.valueVariant}
          sx={{
            fontWeight: 700,
            color: accentColor,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {/* Label */}
        <Typography
          variant={config.labelVariant}
          sx={{
            color: colors.textSecondary,
            mt: 0.5,
          }}
        >
          {label}
        </Typography>

        {/* Trend (optional) */}
        {trend !== undefined && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              mt: 1,
            }}
          >
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: "#10b981" }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: "#ef4444" }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend >= 0 ? "#10b981" : "#ef4444",
                fontWeight: 500,
              }}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% {trendLabel || ""}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

// =============================================================================
// Stats Row Component
// =============================================================================

/**
 * StatsRow - Displays multiple stats in a responsive grid
 */
export const StatsRow = ({ stats, columns = 4, size = "medium", sx = {} }) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return { xs: 6, sm: 6, md: 6 };
      case 3:
        return { xs: 6, sm: 4, md: 4 };
      case 4:
      default:
        return { xs: 6, sm: 3, md: 3 };
    }
  };

  const gridCols = getGridCols();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: `repeat(2, 1fr)`,
          sm: `repeat(${Math.min(columns, 4)}, 1fr)`,
        },
        gap: 2,
        ...sx,
      }}
    >
      {stats.map((stat, index) => (
        <StatsCard key={index} size={size} {...stat} />
      ))}
    </Box>
  );
};

export default StatsCard;
