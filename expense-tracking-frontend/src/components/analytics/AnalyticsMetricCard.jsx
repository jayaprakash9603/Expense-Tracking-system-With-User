import React from "react";
import { Tooltip } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Compact metric tile for analytics / expense detail views.
 * Clear label → value hierarchy, tabular numbers, accessible contrast.
 */
const AnalyticsMetricCard = ({
  label,
  value,
  icon,
  accentColor,
  tooltip,
  highlight = false,
}) => {
  const { colors, mode } = useTheme();
  const tone = accentColor || colors.primary_accent || "#00DAC6";

  const card = (
    <div
      style={{
        height: "100%",
        minHeight: 84,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10,
        padding: "14px 14px 12px",
        borderRadius: 12,
        border: "1px solid var(--color-border-color)",
        background:
          mode === "dark"
            ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
            : colors.primary_bg,
        boxShadow:
          mode === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
        transition: "border-color 160ms ease, transform 160ms ease",
        cursor: tooltip ? "help" : "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${tone}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border_color;
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${tone}18`,
            color: tone,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-secondary-text)",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          fontSize: highlight ? "1.2rem" : "1.1rem",
          fontWeight: 700,
          lineHeight: 1.15,
          color: highlight ? tone : colors.primary_text,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );

  if (!tooltip) return card;

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <div style={{ height: "100%" }}>{card}</div>
    </Tooltip>
  );
};

export default AnalyticsMetricCard;
