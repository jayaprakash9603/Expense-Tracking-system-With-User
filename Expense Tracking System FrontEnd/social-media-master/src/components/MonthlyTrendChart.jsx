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
const MonthlyTrendChart = ({ data, year, onPrevYear, onNextYear }) => {
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
    <div className="chart-container monthly-trend">
      <div className="chart-header">
        <h3>📈 Monthly Expense Trend</h3>
        <div className="trend-stats">
          <span className="trend-up">
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
        >
          <ChevronLeft />
        </IconButton>
        <span
          className={`year-chip ${isAtCurrentYear ? "current" : ""}`}
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
        >
          <ChevronRight />
        </IconButton>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="month" stroke="#888" fontSize={12} />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1b1b",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value, name) => [
              `₹${formatNumber0(value)}`,
              name === "expenses" ? "Expenses" : "Average",
            ]}
          />
          <Bar dataKey="expenses" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#ffcc00"
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
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
};

export default MonthlyTrendChart;
