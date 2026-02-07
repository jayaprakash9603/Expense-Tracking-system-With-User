import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import AppCard from "./AppCard";
import { useTheme } from "../../../hooks/useTheme";

/**
 * StatsCard - Semantic card for displaying statistics
 *
 * Use for dashboard stats like "Total Expenses", "Budget Remaining", etc.
 *
 * @example
 * <StatsCard
 *   title="Total Expenses"
 *   value="$1,234.56"
 *   subtitle="This month"
 *   icon={<MoneyIcon />}
 *   trend={{ value: 12, direction: 'up' }}
 * />
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  loading = false,
  sx = {},
  ...props
}) => {
  const { colors } = useTheme();

  // Trend color based on direction
  const getTrendColor = () => {
    if (!trend) return colors.secondary_text;
    return trend.direction === "up"
      ? colors.success || "#22c55e"
      : trend.direction === "down"
        ? colors.error || "#ef4444"
        : colors.secondary_text;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === "up"
      ? "↑"
      : trend.direction === "down"
        ? "↓"
        : "";
  };

  return (
    <AppCard
      onClick={onClick}
      padding="default"
      sx={{
        minWidth: "200px",
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary_text || "#9ca3af",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: colors.primary_text || "#fff",
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {loading ? "..." : value}
          </Typography>

          {(subtitle || trend) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginTop: "8px",
              }}
            >
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text || "#9ca3af",
                    fontSize: "0.75rem",
                  }}
                >
                  {subtitle}
                </Typography>
              )}

              {trend && (
                <Typography
                  variant="caption"
                  sx={{
                    color: getTrendColor(),
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  {getTrendIcon()} {Math.abs(trend.value)}%
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              backgroundColor: colors.hover_bg || "rgba(0, 218, 198, 0.1)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.primary_accent || "#00DAC6",
              "& .MuiSvgIcon-root": {
                fontSize: "24px",
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </AppCard>
  );
};

StatsCard.propTypes = {
  /** Card title */
  title: PropTypes.string.isRequired,
  /** Main value to display */
  value: PropTypes.node.isRequired,
  /** Subtitle text */
  subtitle: PropTypes.string,
  /** Icon element */
  icon: PropTypes.node,
  /** Trend indicator */
  trend: PropTypes.shape({
    value: PropTypes.number.isRequired,
    direction: PropTypes.oneOf(["up", "down", "neutral"]).isRequired,
  }),
  /** Click handler */
  onClick: PropTypes.func,
  /** Loading state */
  loading: PropTypes.bool,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default StatsCard;
