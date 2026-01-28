import React, { useMemo } from "react";
import { Typography } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";
import dayjs from "dayjs";

/**
 * Monthly Trend Chart showing spending trends over time.
 * Displays area chart with current vs previous period comparison.
 *
 * @param {Array} data - Array of monthly spending data
 * @param {string} title - Chart title
 * @param {string} currencySymbol - Currency symbol for formatting
 * @param {Object} comparison - Month comparison data { currentMonthAmount, previousMonthAmount, percentageChange }
 */
const MonthlyTrendChart = ({
  data = [],
  title = "Monthly Trend",
  currencySymbol = "₹",
  comparison,
  accentColor = "#00DAC6",
}) => {
  const { colors, mode } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      name: item.month || `${item.monthNumber}/${item.year}`,
      amount: item.amount || 0,
      transactions: item.transactionCount || 0,
    }));
  }, [data]);

  const formatCurrency = (value) => {
    if (value == null) return `${currencySymbol}0`;
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
    }
    return `${currencySymbol}${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: mode === "dark" ? "#1a1a1a" : "#ffffff",
            border: `1px solid ${colors.border_color}`,
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            sx={{
              color: colors.primary_text,
              fontWeight: 600,
              fontSize: "0.85rem",
              marginBottom: "8px",
            }}
          >
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                }}
              />
              <Typography
                sx={{
                  color: colors.secondary_text,
                  fontSize: "0.75rem",
                }}
              >
                {entry.name}:{" "}
                <span style={{ color: colors.primary_text, fontWeight: 600 }}>
                  {currencySymbol}
                  {entry.value?.toLocaleString("en-IN") || 0}
                </span>
              </Typography>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "16px 20px",
    position: "relative",
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div style={containerStyle}>
        <Typography
          variant="subtitle1"
          sx={{ color: colors.primary_text, fontWeight: 600, marginBottom: "16px" }}
        >
          {title}
        </Typography>
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ color: colors.secondary_text }}>
            No trend data available
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: colors.primary_text, fontWeight: 600 }}
        >
          {title}
        </Typography>

        {/* Comparison badge */}
        {comparison && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              backgroundColor:
                comparison.percentageChange > 0 ? "#ff4d4f15" : "#52c41a15",
              borderRadius: "20px",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                color:
                  comparison.percentageChange > 0 ? "#ff4d4f" : "#52c41a",
                fontWeight: 600,
              }}
            >
              {comparison.percentageChange > 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.percentageChange).toFixed(1)}% from{" "}
              {comparison.previousMonthName}
            </Typography>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.border_color}
            opacity={0.5}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: colors.secondary_text }}
            tickLine={false}
            axisLine={{ stroke: colors.border_color }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.secondary_text }}
            tickLine={false}
            axisLine={{ stroke: colors.border_color }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            name="Amount"
            stroke={accentColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
            dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
