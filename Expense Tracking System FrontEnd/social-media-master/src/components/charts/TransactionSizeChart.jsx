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
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <Target size={20} /> Transaction Size Distribution
        </h3>
        <div className="chart-subtitle">
          Payment method usage by transaction amount ranges
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="range" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
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
