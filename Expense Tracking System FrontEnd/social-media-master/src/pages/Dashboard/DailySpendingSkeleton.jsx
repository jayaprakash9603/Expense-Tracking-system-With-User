import React from "react";
import ChartSkeleton from "./ChartSkeleton";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

// Dedicated skeleton for Daily Spending Pattern chart, including header controls placeholders.
// This wraps ChartSkeleton with the appropriate header layout so callers can just use <DailySpendingSkeleton />
// Props:
//  timeframe: string (for potential future conditional variations)
//  height: optional number to override computed responsive height
// The default heights have been reduced slightly to better match the final chart size.
const DailySpendingSkeleton = ({
  timeframe = "this_month",
  height: overrideHeight,
}) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const computed = isMobile ? 200 : isTablet ? 240 : 280;
  const height = overrideHeight || computed;

  return (
    <div
      className="chart-container daily-spending-chart"
      style={{
        backgroundColor: colors.secondary_bg,
        border: "none", // Remove border as requested
      }}
    >
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text }}>
          📊 Daily Spending Pattern
        </h3>
        <div className="chart-controls">
          <div className="time-selector skeleton-pill" />
          <div className="type-toggle">
            <div className="toggle-btn loss skeleton-pill" />
            <div className="toggle-btn gain skeleton-pill" />
          </div>
        </div>
      </div>
      <ChartSkeleton height={height} variant="line" noHeader />
    </div>
  );
};

export default DailySpendingSkeleton;
