import React from "react";
import { useTheme } from "../../hooks/useTheme";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const VARIANTS = {
  blue: {
    bg: "linear-gradient(135deg, #d8f0fe 0%, #bde0fe 100%)",
    darkBg: "linear-gradient(135deg, #1e3a5f 0%, #0f2942 100%)",
    iconBg: "rgba(59, 130, 246, 0.2)",
    iconColor: "#3b82f6",
    textColor: "#1e3a8a",
    darkTextColor: "#93c5fd",
    valueColor: "#1e40af",
    darkValueColor: "#bfdbfe",
    lineColor: "#2563eb",
  },
  purple: {
    bg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
    darkBg: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
    iconBg: "rgba(139, 92, 246, 0.2)",
    iconColor: "#8b5cf6",
    textColor: "#4c1d95",
    darkTextColor: "#c4b5fd",
    valueColor: "#5b21b6",
    darkValueColor: "#ddd6fe",
    lineColor: "#7c3aed",
  },
  yellow: {
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    darkBg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    iconBg: "rgba(245, 158, 11, 0.2)",
    iconColor: "#f59e0b",
    textColor: "#78350f",
    darkTextColor: "#fcd34d",
    valueColor: "#92400e",
    darkValueColor: "#fde68a",
    lineColor: "#d97706",
  },
  red: {
    bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
    darkBg: "linear-gradient(135deg, #881337 0%, #4c0519 100%)",
    iconBg: "rgba(244, 63, 94, 0.2)",
    iconColor: "#f43f5e",
    textColor: "#881337",
    darkTextColor: "#fda4af",
    valueColor: "#9f1239",
    darkValueColor: "#fecdd3",
    lineColor: "#e11d48",
  }
};

const SimpleSparkline = ({ data, color, width = 60, height = 24 }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 -2 ${width} ${height + 4}`} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const ModernOverviewCard = ({
  title,
  value,
  icon,
  percentage,
  trend = "up", // "up" or "down"
  sparklineData = [3, 4, 3, 5, 8, 6, 7], // default dummy data
  variant = "blue",
  compact = false,
}) => {
  const { mode: themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const styles = VARIANTS[variant] || VARIANTS.blue;

  return (
    <div
      className={`modern-overview-card${compact ? " is-compact" : ""}`}
      style={{
        background: isDark ? styles.darkBg : styles.bg,
        borderRadius: compact ? "12px" : "16px",
        padding: compact ? "12px" : "20px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: compact ? "108px" : "130px",
        height: "100%",
        width: "100%",
        minWidth: 0,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Subtle Dot Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "50%",
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
          maskImage: "linear-gradient(to right, black, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
        <div
          style={{
            background: styles.iconBg,
            color: styles.iconColor,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${styles.iconBg}`
          }}
        >
          {icon}
        </div>
        
        {percentage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              color: isDark ? styles.darkTextColor : styles.textColor,
              fontSize: compact ? "10px" : "13px",
              fontWeight: 600,
              maxWidth: "58%",
              textAlign: "right",
              lineHeight: 1.2,
            }}
          >
            {trend === "up" ? (
              <TrendingUpIcon sx={{ fontSize: compact ? 14 : 16, flexShrink: 0 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: compact ? 14 : 16, flexShrink: 0 }} />
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {percentage}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 8,
          zIndex: 1,
          marginTop: compact ? "10px" : "16px",
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: isDark ? styles.darkTextColor : styles.textColor,
              fontSize: compact ? "11px" : "13px",
              fontWeight: 500,
              marginBottom: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: isDark ? styles.darkValueColor : styles.valueColor,
              fontSize: compact ? "1.15rem" : "24px",
              fontWeight: 700,
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
        </div>

        <div style={{ paddingBottom: "2px", flexShrink: 0 }}>
          <SimpleSparkline
            data={sparklineData}
            color={styles.lineColor}
            width={compact ? 40 : 50}
            height={compact ? 16 : 20}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernOverviewCard;
