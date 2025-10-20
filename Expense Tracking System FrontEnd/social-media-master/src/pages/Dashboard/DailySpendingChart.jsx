import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMediaQuery } from "@mui/material";

// Zero-decimal formatter local to this component
const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

// Reusable Daily Spending Pattern chart
// Props:
//  data: Array<{ day, spending, type }>
//  timeframe: string (this_month | last_month | last_3_months)
//  onTimeframeChange(value)
//  selectedType: 'loss' | 'gain'
//  onTypeToggle(value)
const DailySpendingChart = ({
  data,
  timeframe,
  onTimeframeChange,
  selectedType,
  onTypeToggle,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const chartHeight = isMobile ? 220 : isTablet ? 260 : 300;
  const hideXAxis = timeframe === "last_3_months" || isMobile;
  const animationKey = `${timeframe}-${selectedType}-${
    Array.isArray(data) ? data.length : 0
  }`;
  const safeData = Array.isArray(data) ? data : [];
  const selType = selectedType || "loss";
  const filteredData = selType
    ? safeData.filter((item) => item.type === selType || !item.type)
    : safeData;
  const chartData = filteredData.map((item) => ({
    day: item.day ? new Date(item.day).getDate() : "",
    spending: item.spending ?? 0,
    date: item.day,
    type: item.type,
  }));
  const color = selType === "gain" ? "#14b8a6" : "#ff5252";
  const gradId = `spendingGradient-${selType}`;

  return (
    <div className="chart-container daily-spending-chart fade-in">
      <div className="chart-header">
        <h3>📊 Daily Spending Pattern</h3>
        <div className="chart-controls">
          {onTimeframeChange && (
            <select
              className="time-selector"
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
            </select>
          )}
          {onTypeToggle && (
            <div className="type-toggle">
              <button
                type="button"
                className={`toggle-btn loss ${
                  selType === "loss" ? "active" : ""
                }`}
                onClick={() => onTypeToggle("loss")}
                aria-pressed={selType === "loss"}
              >
                Loss
              </button>
              <button
                type="button"
                className={`toggle-btn gain ${
                  selType === "gain" ? "active" : ""
                }`}
                onClick={() => onTypeToggle("gain")}
                aria-pressed={selType === "gain"}
              >
                Gain
              </button>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={chartData} key={animationKey}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="day"
            stroke="#888"
            fontSize={12}
            tickLine={false}
            hide={hideXAxis}
          />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0];
              const rawDate = p.payload.date || p.payload.day || "";
              let label = "";
              if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d)) {
                  label = d.toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                  });
                } else {
                  label = `Day ${p.payload.day}`;
                }
              }
              return (
                <div
                  style={{
                    backgroundColor: "#1b1b1b",
                    border: "1px solid #14b8a6",
                    borderRadius: 8,
                    color: "#fff",
                    padding: 8,
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#cfd8dc" }}>{label}</div>
                  <div style={{ fontWeight: 700, color: "#14b8a6" }}>
                    ₹{formatNumber0(p.value)}
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke={color}
            fillOpacity={0.3}
            fill={`url(#${gradId})`}
            strokeWidth={2}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySpendingChart;
