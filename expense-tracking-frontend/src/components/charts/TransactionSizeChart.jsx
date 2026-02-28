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
import { Target } from "lucide-react";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";

// Transaction Size Distribution Chart
// Data shape: [{ range: '₹0-100', MethodA: count, MethodB: count, ... }]
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

const TransactionSizeChart = ({ data = [], methodsColors = [] }) => {
  const { colors, mode } = useTheme();

  const keys = useMemo(() => {
    const first = data?.[0] || {};
    return Object.keys(first).filter((k) => k !== "range");
  }, [data]);
  const colorMap = useMemo(() => {
    const map = new Map();
    methodsColors.forEach((m) => map.set(m.method, m.color));
    return map;
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
          <Target size={20} /> Transaction Size Distribution
        </h3>
        <div
          className="chart-subtitle"
          style={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}
        >
          Payment method usage by transaction amount ranges
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
            dataKey="range"
            stroke={mode === "dark" ? "#888" : "#6b7280"}
            fontSize={12}
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
          {keys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              fill={
                colorMap.get(k) || COLORS_FALLBACK[i % COLORS_FALLBACK.length]
              }
              name={k}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionSizeChart;
