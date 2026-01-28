import React from "react";
import { Typography, Tooltip, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { useTheme } from "../../hooks/useTheme";

/**
 * Reusable KPI Card for displaying key metrics with optional trend indicators.
 * Used in Category Analytics and other analytics views.
 *
 * @param {string} title - Card title/label
 * @param {string|number} value - Main metric value
 * @param {string} subtitle - Optional subtitle text
 * @param {number} change - Percentage change (positive/negative)
 * @param {string} trend - Trend direction: 'up', 'down', 'stable'
 * @param {React.ReactNode} icon - Optional icon component
 * @param {string} accentColor - Border/accent color
 * @param {string} tooltip - Tooltip text for the card
 * @param {boolean} compact - Use compact layout
 */
const AnalyticsKPICard = ({
  title,
  value,
  subtitle,
  change,
  trend,
  icon,
  accentColor = "#00DAC6",
  tooltip,
  compact = false,
}) => {
  const { colors, mode } = useTheme();

  const getTrendIcon = () => {
    if (trend === "up" || change > 0) {
      return <TrendingUpIcon sx={{ fontSize: 16, color: "#52c41a" }} />;
    }
    if (trend === "down" || change < 0) {
      return <TrendingDownIcon sx={{ fontSize: 16, color: "#ff4d4f" }} />;
    }
    return <TrendingFlatIcon sx={{ fontSize: 16, color: "#8c8c8c" }} />;
  };

  const getTrendColor = () => {
    if (trend === "up" || change > 0) return "#52c41a";
    if (trend === "down" || change < 0) return "#ff4d4f";
    return "#8c8c8c";
  };

  const cardStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: "12px",
    padding: compact ? "12px 16px" : "16px 20px",
    minHeight: compact ? "80px" : "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  };

  const hoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 20px ${accentColor}20`,
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const content = (
    <div
      style={{
        ...cardStyle,
        ...(isHovered ? hoverStyle : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: compact ? "4px" : "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && (
            <div
              style={{
                width: compact ? "28px" : "36px",
                height: compact ? "28px" : "36px",
                borderRadius: "8px",
                backgroundColor: `${accentColor}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
          )}
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              fontSize: compact ? "0.7rem" : "0.75rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>
        </div>

        {(change !== undefined || trend) && (
          <Chip
            icon={getTrendIcon()}
            label={change !== undefined ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : ""}
            size="small"
            sx={{
              backgroundColor: `${getTrendColor()}15`,
              color: getTrendColor(),
              fontWeight: "bold",
              fontSize: "0.65rem",
              height: "22px",
              "& .MuiChip-icon": { marginLeft: "4px" },
              "& .MuiChip-label": { padding: change !== undefined ? "0 6px" : "0 4px" },
            }}
          />
        )}
      </div>

      {/* Value */}
      <Typography
        variant="h4"
        sx={{
          color: colors.primary_text,
          fontSize: compact ? "1.4rem" : "1.8rem",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: colors.secondary_text,
            fontSize: "0.7rem",
            marginTop: "4px",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default AnalyticsKPICard;
