import React from "react";
import { Typography, Chip } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "../../hooks/useTheme";

/**
 * Insights Panel for displaying AI-generated or rule-based insights.
 * Supports INFO, WARNING, and SUGGESTION types with appropriate styling.
 *
 * @param {Array} insights - Array of insight objects { type, title, message, icon, actionText }
 * @param {string} title - Panel title
 * @param {number} maxItems - Maximum number of insights to display
 */
const InsightsPanel = ({ insights = [], title = "Insights", maxItems = 5 }) => {
  const { colors, mode } = useTheme();

  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightStyles = (type) => {
    switch (type?.toUpperCase()) {
      case "WARNING":
        return {
          bgColor: "#faad1415",
          borderColor: "#faad14",
          textColor: "#faad14",
          icon: <WarningIcon sx={{ fontSize: 18, color: "#faad14" }} />,
        };
      case "SUGGESTION":
        return {
          bgColor: "#6366f115",
          borderColor: "#6366f1",
          textColor: "#6366f1",
          icon: <TipsAndUpdatesIcon sx={{ fontSize: 18, color: "#6366f1" }} />,
        };
      case "SUCCESS":
        return {
          bgColor: "#52c41a15",
          borderColor: "#52c41a",
          textColor: "#52c41a",
          icon: <CheckCircleIcon sx={{ fontSize: 18, color: "#52c41a" }} />,
        };
      case "INFO":
      default:
        return {
          bgColor: "#00DAC615",
          borderColor: "#00DAC6",
          textColor: "#00DAC6",
          icon: <InfoIcon sx={{ fontSize: 18, color: "#00DAC6" }} />,
        };
    }
  };

  const containerStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "16px 20px",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#ffd70020",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LightbulbIcon sx={{ fontSize: 18, color: "#ffd700" }} />
        </div>
        <Typography
          variant="subtitle1"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        <Chip
          label={insights.length}
          size="small"
          sx={{
            backgroundColor: "#00DAC620",
            color: "#00DAC6",
            fontWeight: "bold",
            fontSize: "0.65rem",
            height: "20px",
          }}
        />
      </div>

      {/* Insights List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {insights.slice(0, maxItems).map((insight, index) => {
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={index}
              style={{
                backgroundColor: styles.bgColor,
                borderRadius: "8px",
                borderLeft: `3px solid ${styles.borderColor}`,
                padding: "12px 14px",
              }}
            >
              {/* Insight Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                {styles.icon}
                <Typography
                  sx={{
                    color: styles.textColor,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {insight.title}
                </Typography>
              </div>

              {/* Insight Message */}
              <Typography
                sx={{
                  color: colors.primary_text,
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                }}
              >
                {insight.message}
              </Typography>

              {/* Action Text */}
              {insight.actionText && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: "#52c41a" }} />
                  <Typography
                    sx={{
                      color: "#52c41a",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {insight.actionText}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more indicator */}
      {insights.length > maxItems && (
        <Typography
          variant="caption"
          sx={{
            color: colors.secondary_text,
            fontSize: "0.7rem",
            textAlign: "center",
            display: "block",
            marginTop: "12px",
          }}
        >
          +{insights.length - maxItems} more insights
        </Typography>
      )}
    </div>
  );
};

export default InsightsPanel;
