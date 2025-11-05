import React from "react";
import { useTheme } from "../../hooks/useTheme";

// Small pill for summary metrics in selection info bar
// Props: label (string), value (string|number), icon (ReactNode optional)
const SummaryPill = ({ label, value, icon }) => {
  const { colors } = useTheme();

  return (
    <span
      style={{
        background: colors.mode === "dark" ? colors.active_bg : "#f5f5f5",
        border: `1px solid ${colors.border_color}`,
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 11,
        fontWeight: 600,
        color: colors.primary_text,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1.15,
        position: "relative",
        minHeight: 30,
        boxShadow:
          colors.mode === "dark"
            ? "0 2px 4px -1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)"
            : "0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: 13,
            opacity: 0.9,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          opacity: colors.mode === "dark" ? 0.55 : 0.65,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: colors.active_text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </span>
  );
};

export default SummaryPill;
