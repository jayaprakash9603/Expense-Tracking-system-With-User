import React from "react";
import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from "recharts";
import { IconButton, useMediaQuery } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";

const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

/**
 * MonthlyTrendChart
 * Displays monthly expense bars + average line for a given year.
 * Accepts normalized { labels, datasets: [{ data }] } structure.
 */
const MonthlyTrendChart = ({
  data,
  year,
  onPrevYear,
  onNextYear,
  loading = false,
}) => {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const isAtCurrentYear = year >= currentYear;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const chartHeight = isMobile ? 260 : isTablet ? 380 : 480;

  const labels = Array.isArray(data?.labels) ? data.labels : [];
  const series = Array.isArray(data?.datasets?.[0]?.data)
    ? data.datasets[0].data
    : [];
  const presentValues = series.filter((v) => Number.isFinite(v) && v > 0);
  const finiteValues = series.filter((v) => Number.isFinite(v));
  const base = presentValues.length ? presentValues : finiteValues;
  const avgValue = base.length
    ? base.reduce((a, b) => a + b, 0) / base.length
    : 0;
  const chartRows = series.map((value, index) => ({
    month: labels[index] ?? `M${index + 1}`,
    expenses: value,
    average: avgValue,
  }));

  return (
    <div
      className="chart-container monthly-trend"
      style={{
        position: "relative",
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text }}>📈 Monthly Expense Trend</h3>
        <div className="trend-stats">
          <span className="trend-up" style={{ color: colors.primary_accent }}>
            ↗ {base.length ? "12%" : "--"} vs last year
          </span>
        </div>
      </div>
      <div className="chart-nav-bar">
        <IconButton
          className="nav-btn nav-left"
          size="small"
          onClick={onPrevYear}
          aria-label="Previous year"
          title="Go to previous year"
          sx={{ color: colors.primary_accent }}
        >
          <ChevronLeft />
        </IconButton>
        <span
          className={`year-chip ${isAtCurrentYear ? "current" : ""}`}
          style={{
            backgroundColor: colors.tertiary_bg,
            color: isAtCurrentYear
              ? colors.primary_accent
              : colors.primary_text,
            border: `1px solid ${
              isAtCurrentYear ? colors.primary_accent : colors.border_color
            }`,
          }}
          title={isAtCurrentYear ? "Current year" : undefined}
        >
          {year}
        </span>
        <IconButton
          className={`nav-btn nav-right ${
            isAtCurrentYear ? "is-disabled" : ""
          }`}
          size="small"
          onClick={onNextYear}
          disabled={isAtCurrentYear}
          aria-label="Next year"
          title={
            isAtCurrentYear
              ? "You're viewing the current year"
              : "Go to next year"
          }
          sx={{
            color: isAtCurrentYear
              ? colors.secondary_text
              : colors.primary_accent,
          }}
        >
          <ChevronRight />
        </IconButton>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />
          <XAxis dataKey="month" stroke={colors.secondary_text} fontSize={12} />
          <YAxis
            stroke={colors.secondary_text}
            fontSize={12}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "8px",
              color: colors.primary_text,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            labelStyle={{
              color: colors.primary_text,
              fontWeight: "600",
            }}
            itemStyle={{
              color: colors.primary_text,
            }}
            formatter={(value, name) => [
              `₹${formatNumber0(value)}`,
              name === "expenses" ? "Expenses" : "Average",
            ]}
          />
          <Bar
            dataKey="expenses"
            fill={colors.primary_accent}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#ffcc00"
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Loading indicator when skeleton is disabled */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: colors.secondary_text,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

MonthlyTrendChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({ data: PropTypes.arrayOf(PropTypes.number) })
    ),
  }),
  year: PropTypes.number.isRequired,
  onPrevYear: PropTypes.func.isRequired,
  onNextYear: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default MonthlyTrendChart;
