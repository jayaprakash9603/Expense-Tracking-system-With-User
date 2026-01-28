import React, { useMemo } from "react";
import { Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "../../hooks/useTheme";

/**
 * Payment Method Distribution Chart showing breakdown of expenses by payment method.
 * Donut chart with percentage labels.
 *
 * @param {Array} data - Array of payment method distribution { paymentMethod, displayName, totalAmount, percentage, color }
 * @param {string} title - Chart title
 * @param {string} currencySymbol - Currency symbol
 */
const PaymentDistributionChart = ({
  data = [],
  title = "Payment Method",
  currencySymbol = "₹",
}) => {
  const { colors, mode } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Assign default colors if not provided
    const defaultColors = [
      "#6366f1", // UPI - Indigo
      "#22c55e", // Cash - Green
      "#f97316", // Card - Orange
      "#ef4444", // Credit Card - Red
      "#3b82f6", // Debit Card - Blue
      "#8b5cf6", // NetBanking - Purple
      "#ec4899", // Other - Pink
    ];

    return data.map((item, index) => ({
      name: item.displayName || item.paymentMethod || "Unknown",
      value: item.totalAmount || 0,
      percentage: item.percentage || 0,
      color: item.color || defaultColors[index % defaultColors.length],
      transactions: item.transactionCount || 0,
    }));
  }, [data]);

  const formatCurrency = (value) => {
    if (value == null) return `${currencySymbol}0`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("₹", currencySymbol);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: data.color,
              }}
            />
            <Typography
              sx={{
                color: colors.primary_text,
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {data.name}
            </Typography>
          </div>
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.75rem",
              marginBottom: "4px",
            }}
          >
            Amount:{" "}
            <span style={{ color: colors.primary_text, fontWeight: 600 }}>
              {formatCurrency(data.value)}
            </span>
          </Typography>
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.75rem",
              marginBottom: "4px",
            }}
          >
            Percentage:{" "}
            <span style={{ color: colors.primary_text, fontWeight: 600 }}>
              {data.percentage.toFixed(1)}%
            </span>
          </Typography>
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.75rem",
            }}
          >
            Transactions:{" "}
            <span style={{ color: colors.primary_text, fontWeight: 600 }}>
              {data.transactions}
            </span>
          </Typography>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          marginTop: "12px",
        }}
      >
        {payload?.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: entry.color,
              }}
            />
            <Typography
              sx={{
                color: colors.secondary_text,
                fontSize: "0.7rem",
              }}
            >
              {entry.value}
            </Typography>
            <Typography
              sx={{
                color: colors.primary_text,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {chartData.find((d) => d.name === entry.value)?.percentage.toFixed(0)}%
            </Typography>
          </div>
        ))}
      </div>
    );
  };

  const containerStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "16px 20px",
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
            No payment data available
          </Typography>
        </div>
      </div>
    );
  }

  // Find top payment method
  const topMethod = chartData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    chartData[0]
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <Typography
        variant="subtitle1"
        sx={{ color: colors.primary_text, fontWeight: 600, marginBottom: "8px" }}
      >
        {title}
      </Typography>

      {/* Top method highlight */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            backgroundColor: `${topMethod.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem" }}>💳</Typography>
        </div>
        <div>
          <Typography
            sx={{
              color: colors.primary_text,
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {topMethod.name}
          </Typography>
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.7rem",
            }}
          >
            {topMethod.percentage.toFixed(0)}% • Top Method
          </Typography>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <CustomLegend
        payload={chartData.map((item) => ({
          value: item.name,
          color: item.color,
        }))}
      />
    </div>
  );
};

export default PaymentDistributionChart;
