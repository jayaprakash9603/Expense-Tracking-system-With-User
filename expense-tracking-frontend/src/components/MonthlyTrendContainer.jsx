import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useMonthlyTrendData from "../hooks/useMonthlyTrendData";
import MonthlyTrendChart from "./MonthlyTrendChart";
import ChartSkeleton from "../pages/Dashboard/ChartSkeleton";
import EmptyStateCard from "./EmptyStateCard";
import { useTheme } from "../hooks/useTheme";

/**
 * MonthlyTrendContainer
 * Manages year state and data fetching via useMonthlyTrendData.
 * Props:
 *  - initialYear?: number (default current year)
 *  - refreshTrigger?: any (refetch when changes)
 *  - height?: number (skeleton/chart height)
 *  - maxYear?: number (upper bound when clicking next year)
 *  - showSkeleton?: boolean (default true - enable/disable skeleton loader)
 */
const MonthlyTrendContainer = ({
  initialYear,
  refreshTrigger,
  height = 480,
  maxYear,
  showSkeleton = true,
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear || currentYear);
  const { data, loading } = useMonthlyTrendData({ year, refreshTrigger });
  const effectiveMax = maxYear || currentYear;
  const { colors } = useTheme();

  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => Math.min(effectiveMax, y + 1));

  const hasData =
    Array.isArray(data?.labels) &&
    data.labels.length > 0 &&
    Array.isArray(data?.datasets?.[0]?.data) &&
    data.datasets[0].data.some((v) => Number.isFinite(v));
  const showEmpty = !loading && !hasData;

  if (showEmpty) {
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
          <h3 style={{ color: colors.primary_text }}>
            📈 Monthly Expense Trend
          </h3>
        </div>
        <EmptyStateCard
          icon="📉"
          title="No trend data yet"
          message="Add expenses to see your monthly trend."
          height={height}
          bordered={false}
        />
      </div>
    );
  }

  return loading && showSkeleton ? (
    <ChartSkeleton height={height} />
  ) : (
    <MonthlyTrendChart
      data={data}
      year={year}
      onPrevYear={handlePrevYear}
      onNextYear={handleNextYear}
      loading={loading}
    />
  );
};

MonthlyTrendContainer.propTypes = {
  initialYear: PropTypes.number,
  refreshTrigger: PropTypes.any,
  height: PropTypes.number,
  maxYear: PropTypes.number,
  showSkeleton: PropTypes.bool,
};

export default MonthlyTrendContainer;
