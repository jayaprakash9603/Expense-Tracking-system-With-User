import React from "react";
import { useSelector } from "react-redux";
import { getThemeColors } from "../../../../config/themeConfig";

/**
 * Reusable Stat Card Component for Admin Dashboards
 * Displays a metric with optional growth indicator
 * 
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value
 * @param {string} props.growth - Optional growth percentage (e.g., "+12.5%")
 * @param {string} props.color - Optional custom color for the value
 * @param {React.ReactNode} props.icon - Optional icon component
 */
const StatCard = ({ label, value, growth = null, color = null, icon = null }) => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

  const isPositiveGrowth = growth && growth.startsWith("+");
  const isNegativeGrowth = growth && growth.startsWith("-");

  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: themeColors.card_bg }}
    >
      <div className="flex justify-between items-start mb-2">
        <p
          className="text-sm"
          style={{ color: themeColors.secondary_text }}
        >
          {label}
        </p>
        {icon && <div style={{ color: themeColors.accent }}>{icon}</div>}
      </div>
      <p
        className="text-2xl font-bold"
        style={{ color: color || themeColors.primary_text }}
      >
        {value}
      </p>
      {growth && (
        <p
          className="text-sm mt-1"
          style={{
            color: isPositiveGrowth
              ? "#4caf50"
              : isNegativeGrowth
              ? "#f44336"
              : themeColors.secondary_text,
          }}
        >
          {growth}
        </p>
      )}
    </div>
  );
};

export default StatCard;
