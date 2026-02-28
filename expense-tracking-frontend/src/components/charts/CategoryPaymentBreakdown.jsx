import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";

// Category-wise Payment Breakdown Chart
// Data shape: [{ category: 'Food', MethodA: amount, MethodB: amount, ... }]
// methodsColors: [{ method, color }]
const COLORS_FALLBACK = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#ffd166",
  "#f77f00",
  "#e63946",
  "#073b4c",
  "#fcbf49",
  "#f95738",
  "#a8dadc",
];

const CategoryPaymentBreakdown = ({ data = [], methodsColors = [] }) => {
  const { colors, mode } = useTheme();

  const methodKeys = useMemo(() => {
    const first = data?.[0] || {};
    return Object.keys(first).filter((k) => k !== "category");
  }, [data]);
  const colorMap = useMemo(() => {
    const m = new Map();
    methodsColors.forEach(({ method, color }) => m.set(method, color));
    return m;
  }, [methodsColors]);

  return (
    <div
      className="chart-container"
      style={{
        background: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text }}>
          🏷️ Category-wise Payment Breakdown
        </h3>
        <div
          className="chart-subtitle"
          style={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}
        >
          Payment method preferences by spending category
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={mode === "dark" ? "#2a2a2a" : "#e5e7eb"}
          />
          <XAxis
            dataKey="category"
            stroke={mode === "dark" ? "#888" : "#6b7280"}
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke={mode === "dark" ? "#888" : "#6b7280"} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "8px",
              color: colors.primary_text,
            }}
          />
          <Legend />
          {methodKeys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              stackId="a"
              fill={
                colorMap.get(k) || COLORS_FALLBACK[i % COLORS_FALLBACK.length]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPaymentBreakdown;
