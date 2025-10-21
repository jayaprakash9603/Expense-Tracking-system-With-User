import React from "react";

/**
 * Shared Skeleton Components
 * Lightweight presentational placeholders reused across analytics pages.
 * Each component accepts minimal props to adjust sizing/counts without duplicating markup.
 */

export const HeaderSkeleton = ({
  rootClassName = "category-report-header",
  controls = 3,
}) => (
  <div className={rootClassName}>
    <div className="header-left">
      <div className="skeleton-title" />
      <div className="skeleton-subtitle" />
    </div>
    <div className="header-controls">
      {[...Array(controls)].map((_, i) => (
        <div key={i} className="skeleton-control" />
      ))}
    </div>
  </div>
);

export const OverviewCardSkeleton = () => (
  <div className="overview-card skeleton">
    <div className="skeleton-icon" />
    <div className="card-content">
      <div className="skeleton-card-title" />
      <div className="skeleton-card-value" />
      <div className="skeleton-card-change" />
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 400, bars = 8 }) => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title" />
      <div className="skeleton-chart-subtitle" />
    </div>
    <div className="skeleton-chart-body" style={{ height }}>
      <div className="skeleton-chart-content">
        <div className="skeleton-bars">
          {[...Array(bars)].map((_, i) => (
            <div
              key={i}
              className="skeleton-bar"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const PieChartSkeleton = ({ height = 360, chipCount = 7 }) => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title" />
      <div className="skeleton-chart-subtitle" />
    </div>
    <div className="distribution-content">
      <div className="distribution-left" style={{ height }}>
        <div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            margin: "0 auto",
            marginTop: 20,
          }}
        >
          <div
            className="skeleton"
            style={{ position: "absolute", inset: 0, borderRadius: "50%" }}
          />
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: "#0e0e0e",
            }}
          />
        </div>
      </div>
      <div className="distribution-right" style={{ gap: 10 }}>
        {[...Array(chipCount)].map((_, i) => (
          <div
            key={i}
            className="category-chip"
            style={{ alignItems: "center" }}
          >
            <div
              className="chip-left"
              style={{ alignItems: "center", gap: 10 }}
            >
              <span
                className="skeleton"
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                }}
              />
              <span
                className="skeleton"
                style={{
                  display: "inline-block",
                  width: 120,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </div>
            <div className="chip-right">
              <span
                className="skeleton"
                style={{
                  display: "inline-block",
                  width: 40,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ headerCells = 6, rows = 9, rowCells = 6 }) => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title" />
      <div className="skeleton-chart-subtitle" />
    </div>
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[...Array(headerCells)].map((_, i) => (
          <div key={i} className="skeleton-table-header-cell" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {[...Array(rowCells)].map((_, j) => (
            <div key={j} className="skeleton-table-cell" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Convenience composite for pages needing a full loading layout pattern (optional use)
export const CategoryLoadingSkeleton = () => (
  <div className="category-report">
    <HeaderSkeleton />
    <div className="category-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>

    <div className="charts-grid">
      <div className="chart-row full-width">
        <ChartSkeleton height={430} />
      </div>
      <div className="chart-row full-width">
        <PieChartSkeleton height={360} />
      </div>
      <div className="chart-row full-width">
        <TableSkeleton />
      </div>
    </div>
  </div>
);

export const PaymentLoadingSkeleton = () => (
  <div className="payment-methods-report">
    <HeaderSkeleton rootClassName="payment-methods-header" />
    <div className="payment-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>
    <div className="chart-row full-width" style={{ marginBottom: 32 }}>
      <PieChartSkeleton height={360} />
    </div>
    <div className="charts-grid">
      <div className="chart-row full-width">
        <ChartSkeleton height={300} />
      </div>

      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>

      <div className="chart-row full-width">
        <TableSkeleton headerCells={7} rowCells={7} />
      </div>
    </div>
  </div>
);
export const ExpensesLoadingSkeleton = () => (
  <div className="payment-methods-report">
    <HeaderSkeleton rootClassName="payment-methods-header" />
    <div className="payment-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>
    <div className="chart-row full-width" style={{ marginBottom: 32 }}>
      <PieChartSkeleton height={360} />
    </div>
    <div className="charts-grid">
      <div className="chart-row full-width">
        <ChartSkeleton height={300} />
      </div>

      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>

      <div className="chart-row full-width">
        <TableSkeleton headerCells={7} rowCells={7} />
      </div>
    </div>
  </div>
);

export default {
  HeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  TableSkeleton,
  CategoryLoadingSkeleton,
  PaymentLoadingSkeleton,
  ExpensesLoadingSkeleton,
};
