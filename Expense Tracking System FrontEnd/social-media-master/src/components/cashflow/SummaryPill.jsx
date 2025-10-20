import React from "react";

// Small pill for summary metrics in selection info bar
// Props: label (string), value (string|number), icon (ReactNode optional)
const SummaryPill = ({ label, value, icon }) => {
  return (
    <span
      style={{
        background: "#1b1b1b",
        border: "1px solid #262626",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 11,
        fontWeight: 600,
        color: "#cfd3d8",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1.15,
        position: "relative",
        minHeight: 30,
        boxShadow:
          "0 2px 4px -1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)",
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
      <span style={{ opacity: 0.55, fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#00dac6", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </span>
  );
};

export default SummaryPill;
