import React from "react";
import { Box } from "@mui/material";
import AnalyticsMetricCard from "./AnalyticsMetricCard";

/**
 * Responsive 2×4 metric grid for payment / category / expense analytics.
 */
const AnalyticsMetricGrid = ({ items = [], sx = {} }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(2, minmax(0, 1fr))",
        sm: "repeat(4, minmax(0, 1fr))",
      },
      gap: 1.25,
      width: "100%",
      ...sx,
    }}
  >
    {items.map((item) => (
      <AnalyticsMetricCard
        key={item.id || item.label}
        label={item.label}
        value={item.value}
        icon={item.icon}
        accentColor={item.accentColor}
        tooltip={item.tooltip}
        highlight={item.highlight}
      />
    ))}
  </Box>
);

export default AnalyticsMetricGrid;
