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
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";

const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

/**
 * MonthlyTrendChart
 * Displays monthly expense bars + average line for a given year.
 * Compact header on small screens: title left, year controls right.
 */
const MonthlyTrendChart = ({
  data,
  year,
  onPrevYear,
  onNextYear,
  loading = false,
  yoyChange = null,
}) => {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const isAtCurrentYear = year >= currentYear;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const chartHeight = isMobile ? 260 : isTablet ? 320 : 480;
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

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

  const hasYoyComparison =
    yoyChange != null && Number.isFinite(yoyChange.percentChange);
  const yoyDirection = hasYoyComparison
    ? yoyChange.percentChange > 0
      ? "up"
      : yoyChange.percentChange < 0
        ? "down"
        : "flat"
    : null;
  const TrendIcon =
    yoyDirection === "up"
      ? TrendingUp
      : yoyDirection === "down"
        ? TrendingDown
        : TrendingFlat;

  const navBtnSx = {
    width: isMobile ? 40 : 36,
    height: isMobile ? 40 : 36,
    borderRadius: "10px",
    border: `1px solid ${colors.border_color}`,
    backgroundColor: colors.tertiary_bg,
    color: colors.primary_accent,
    "&:hover": {
      backgroundColor: `${colors.primary_accent}18`,
      borderColor: colors.primary_accent,
    },
    "&.Mui-disabled": {
      opacity: 0.4,
      color: colors.secondary_text,
    },
  };

  return (
    <div
      className={`chart-container monthly-trend${isMobile ? " is-mobile" : ""}`}
      style={{
        position: "relative",
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        overflow: "visible",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Row 1: title + year controls aligned */}
      <div
        className="chart-header dashboard-chart-header monthly-trend-header"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 8 : 12,
          flexWrap: "nowrap",
          width: "100%",
          marginBottom: hasYoyComparison ? 8 : 12,
        }}
      >
        <h3
          className="monthly-trend-title"
          style={{
            color: colors.primary_text,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 6 : 8,
            margin: 0,
            minWidth: 0,
            flex: "1 1 auto",
            fontSize: isMobile ? "0.9rem" : "1.05rem",
            fontWeight: 600,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <TrendingUp
            sx={{
              fontSize: isMobile ? 18 : 22,
              color: colors.primary_accent,
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {isMobile ? "Monthly Trend" : "Monthly Expense Trend"}
          </span>
        </h3>

        <div
          className="chart-controls dashboard-chart-controls monthly-year-controls"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            marginLeft: "auto",
          }}
        >
          <IconButton
            className="nav-btn nav-left"
            size="small"
            onClick={onPrevYear}
            aria-label="Previous year"
            title="Go to previous year"
            sx={navBtnSx}
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
              minWidth: isMobile ? 56 : 64,
              textAlign: "center",
              borderRadius: 10,
              padding: isMobile ? "8px 10px" : "6px 12px",
              fontWeight: 700,
              fontSize: isMobile ? "0.9rem" : "0.95rem",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.2,
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
              ...navBtnSx,
              color: isAtCurrentYear
                ? colors.secondary_text
                : colors.primary_accent,
            }}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>

      {/* Row 2: YoY badge — full width under header, not stacked into title column */}
      {hasYoyComparison && (
        <div
          className="trend-stats monthly-trend-yoy"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 12,
            width: "100%",
          }}
        >
          <span
            className={
              yoyDirection === "down"
                ? "trend-down"
                : yoyDirection === "flat"
                  ? "trend-flat"
                  : "trend-up"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            <TrendIcon sx={{ fontSize: isMobile ? 14 : 16 }} aria-hidden="true" />
            {`${Math.abs(yoyChange.percentChange).toFixed(1)}% vs last year`}
          </span>
        </div>
      )}

      <div
        className="dashboard-chart-plot"
        style={{
          width: "100%",
          height: chartHeight,
          minHeight: isMobile ? 240 : undefined,
          position: "relative",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartRows}
            margin={{
              top: 8,
              right: isMobile ? 6 : 12,
              left: isMobile ? -6 : 4,
              bottom: isMobile ? 4 : 4,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />
            <XAxis
              dataKey="month"
              stroke={colors.secondary_text}
              fontSize={isMobile ? 10 : 12}
              interval={0}
              tick={{ fontSize: isMobile ? 9 : 12 }}
              height={isMobile ? 28 : 36}
            />
            <YAxis
              stroke={colors.secondary_text}
              fontSize={isMobile ? 10 : 12}
              width={isMobile ? 40 : 48}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) =>
                `${currencySymbol}${Math.round(value / 1000)}K`
              }
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
                `${currencySymbol}${formatNumber0(value)}`,
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
      </div>

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
      PropTypes.shape({ data: PropTypes.arrayOf(PropTypes.number) }),
    ),
  }),
  year: PropTypes.number.isRequired,
  onPrevYear: PropTypes.func.isRequired,
  onNextYear: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  yoyChange: PropTypes.shape({
    percentChange: PropTypes.number,
    currentTotal: PropTypes.number,
    previousTotal: PropTypes.number,
  }),
};

export default MonthlyTrendChart;
