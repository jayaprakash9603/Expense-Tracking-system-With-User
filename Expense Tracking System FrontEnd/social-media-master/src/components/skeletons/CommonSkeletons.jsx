import React from "react";
import { useTheme } from "../../hooks/useTheme";

/**
 * Shared Skeleton Components
 * Lightweight presentational placeholders reused across analytics pages.
 * Each component accepts minimal props to adjust sizing/counts without duplicating markup.
 */

// Helper function to get skeleton gradient based on theme
const getSkeletonGradient = (mode) => {
  if (mode === "dark") {
    return "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)";
  }
  return "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)";
};

const getSkeletonStyle = (mode) => ({
  background: getSkeletonGradient(mode),
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.5s infinite",
  borderRadius: "4px",
});

export const HeaderSkeleton = ({
  rootClassName = "category-report-header",
  controls = 3,
}) => {
  const { colors, mode } = useTheme();

  return (
    <div className={rootClassName}>
      <div className="header-left">
        <div
          className="skeleton-title"
          style={{
            height: "32px",
            width: "300px",
            ...getSkeletonStyle(mode),
            marginBottom: "8px",
          }}
        />
        <div
          className="skeleton-subtitle"
          style={{
            height: "16px",
            width: "400px",
            ...getSkeletonStyle(mode),
          }}
        />
      </div>
      <div className="header-controls">
        {[...Array(controls)].map((_, i) => (
          <div
            key={i}
            className="skeleton-control"
            style={{
              height: "36px",
              width: "80px",
              ...getSkeletonStyle(mode),
              borderRadius: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * ReportHeaderSkeleton - Skeleton loader for ReportHeader component
 * Matches the structure of ReportHeader with back button, title, subtitle, and controls
 *
 * Usage:
 * ```jsx
 * import { ReportHeaderSkeleton } from "../../components/skeletons/CommonSkeletons";
 *
 * // In your page component with conditional rendering:
 * {loading ? (
 *   <div style={{ background: colors.secondary_bg, padding: "24px" }}>
 *     <ReportHeaderSkeleton />
 *     {/* Rest of your loading skeleton components *\/}
 *   </div>
 * ) : (
 *   <ReportHeader
 *     title="📊 Your Report Title"
 *     subtitle="Your subtitle"
 *     timeframe={timeframe}
 *     flowType={flowType}
 *     onTimeframeChange={setTimeframe}
 *     onFlowTypeChange={setFlowType}
 *     onFilter={handleFilter}
 *     onExport={handleExport}
 *     onBack={handleBack}
 *   />
 * )}
 * ```
 *
 * @param {number} controls - Number of control skeletons (default: 4 for flowType, timeframe, filter, export)
 */
export const ReportHeaderSkeleton = ({ controls = 4 }) => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="report-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        paddingBottom: "24px",
        borderBottom: `1px solid ${colors.border_color}`,
        paddingTop: "24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: colors.tertiary_bg,
      }}
    >
      <div
        className="header-left"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        {/* Back button skeleton */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            ...getSkeletonStyle(mode),
          }}
        />
        <div>
          <div
            className="skeleton-title"
            style={{
              height: "28px",
              width: "250px",
              ...getSkeletonStyle(mode),
              marginBottom: "6px",
            }}
          />
          <div
            className="skeleton-subtitle"
            style={{
              height: "14px",
              width: "180px",
              ...getSkeletonStyle(mode),
            }}
          />
        </div>
      </div>
      <div
        className="header-controls"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {[...Array(controls)].map((_, i) => (
          <div
            key={i}
            className="skeleton-control"
            style={{
              height: "36px",
              width: i < 2 ? "100px" : "90px", // First 2 are selects, last 2 are buttons
              ...getSkeletonStyle(mode),
              borderRadius: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const OverviewCardSkeleton = () => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="overview-card skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div
        className="skeleton-icon"
        style={{
          width: "60px",
          height: "60px",
          ...getSkeletonStyle(mode),
          borderRadius: "12px",
        }}
      />
      <div className="card-content">
        <div
          className="skeleton-card-title"
          style={{
            height: "14px",
            width: "100px",
            ...getSkeletonStyle(mode),
            marginBottom: "8px",
          }}
        />
        <div
          className="skeleton-card-value"
          style={{
            height: "24px",
            width: "120px",
            ...getSkeletonStyle(mode),
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-card-change"
          style={{
            height: "12px",
            width: "140px",
            ...getSkeletonStyle(mode),
          }}
        />
      </div>
    </div>
  );
};

export const ChartSkeleton = ({ height = 400, bars = 8 }) => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="chart-container skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="chart-header">
        <div
          className="skeleton-chart-title"
          style={{
            height: "18px",
            width: "200px",
            ...getSkeletonStyle(mode),
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-chart-subtitle"
          style={{
            height: "14px",
            width: "300px",
            ...getSkeletonStyle(mode),
          }}
        />
      </div>
      <div
        className="skeleton-chart-body"
        style={{
          height,
          background: colors.primary_bg,
          borderRadius: "8px",
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="skeleton-chart-content"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          <div
            className="skeleton-bars"
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-around",
              width: "80%",
              height: "100%",
              gap: "8px",
            }}
          >
            {[...Array(bars)].map((_, i) => (
              <div
                key={i}
                className="skeleton-bar"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  ...getSkeletonStyle(mode),
                  borderRadius: "4px 4px 0 0",
                  flex: 1,
                  minHeight: "20px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PieChartSkeleton = ({ height = 360, chipCount = 7 }) => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="chart-container skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="chart-header">
        <div
          className="skeleton-chart-title"
          style={{
            height: "18px",
            width: "200px",
            ...getSkeletonStyle(mode),
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-chart-subtitle"
          style={{
            height: "14px",
            width: "300px",
            ...getSkeletonStyle(mode),
          }}
        />
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
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                ...getSkeletonStyle(mode),
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "25%",
                left: "25%",
                width: "50%",
                height: "50%",
                borderRadius: "50%",
                background: colors.primary_bg,
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
                    ...getSkeletonStyle(mode),
                  }}
                />
                <span
                  className="skeleton"
                  style={{
                    display: "inline-block",
                    width: 120,
                    height: 12,
                    borderRadius: 6,
                    ...getSkeletonStyle(mode),
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
                    ...getSkeletonStyle(mode),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ headerCells = 6, rows = 9, rowCells = 6 }) => {
  const { colors, mode } = useTheme();

  const headerGradient =
    mode === "dark"
      ? "linear-gradient(90deg, #3a3a3a 25%, #4a4a4a 50%, #3a3a3a 75%)"
      : "linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%)";

  return (
    <div
      className="chart-container skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="chart-header">
        <div
          className="skeleton-chart-title"
          style={{
            height: "18px",
            width: "200px",
            ...getSkeletonStyle(mode),
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-chart-subtitle"
          style={{
            height: "14px",
            width: "300px",
            ...getSkeletonStyle(mode),
          }}
        />
      </div>
      <div className="skeleton-table" style={{ width: "100%" }}>
        <div
          className="skeleton-table-header"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${headerCells}, 1fr)`,
            gap: "12px",
            padding: "12px",
            background: mode === "dark" ? "#2a2a2a" : "#e8e8e8",
            borderRadius: "8px 8px 0 0",
            marginBottom: "8px",
          }}
        >
          {[...Array(headerCells)].map((_, i) => (
            <div
              key={i}
              className="skeleton-table-header-cell"
              style={{
                height: "14px",
                background: headerGradient,
                backgroundSize: "200% 100%",
                animation: "skeleton-shimmer 1.5s infinite",
                borderRadius: "4px",
              }}
            />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="skeleton-table-row"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${rowCells}, 1fr)`,
              gap: "12px",
              padding: "12px",
              borderBottom: `1px solid ${colors.border_color}`,
            }}
          >
            {[...Array(rowCells)].map((_, j) => (
              <div
                key={j}
                className="skeleton-table-cell"
                style={{
                  height: "14px",
                  ...getSkeletonStyle(mode),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AccordionSkeleton = ({ items = 6 }) => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="chart-container skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="chart-header">
        <div
          className="skeleton-chart-title"
          style={{
            height: "18px",
            width: "200px",
            ...getSkeletonStyle(mode),
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-chart-subtitle"
          style={{
            height: "14px",
            width: "300px",
            ...getSkeletonStyle(mode),
          }}
        />
      </div>
      <div className="pm-accordion-container">
        {[...Array(items)].map((_, i) => (
          <div
            key={`accordion-skeleton-${i}`}
            className="pm-accordion-item pm-placeholder"
            aria-hidden="true"
          >
            <div className="pm-accordion-header pm-placeholder-header">
              <div className="pm-header-left">
                <span
                  className="pm-method-name placeholder-block"
                  style={getSkeletonStyle(mode)}
                />
                <span
                  className="pm-method-count placeholder-block"
                  style={getSkeletonStyle(mode)}
                />
              </div>
              <div className="pm-header-right">
                <span
                  className="pm-method-amount placeholder-block"
                  style={getSkeletonStyle(mode)}
                />
                <span className="pm-chevron">▸</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Convenience composite for pages needing a full loading layout pattern (optional use)
export const CategoryLoadingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="category-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeaderSkeleton />
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
        <div className="charts-grid">
          <div className="chart-row full-width">
            <AccordionSkeleton items={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PaymentLoadingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="payment-methods-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeaderSkeleton rootClassName="payment-methods-header" />
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

        <div className="charts-grid">
          <div className="chart-row full-width">
            <AccordionSkeleton items={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExpensesLoadingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="payment-methods-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeaderSkeleton rootClassName="payment-methods-header" />
      <div className="payment-overview-cards">
        {[...Array(4)].map((_, i) => (
          <OverviewCardSkeleton key={i} />
        ))}
      </div>
      {/* <div className="chart-row full-width" style={{ marginBottom: 32 }}>
      <PieChartSkeleton height={360} />
    </div> */}
      <div className="charts-grid">
        {/* <div className="chart-row full-width">
        <ChartSkeleton height={300} />
      </div>

      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div> */}

        <div className="charts-grid">
          <div className="chart-row full-width">
            <AccordionSkeleton items={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  HeaderSkeleton,
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  TableSkeleton,
  AccordionSkeleton,
  CategoryLoadingSkeleton,
  PaymentLoadingSkeleton,
  ExpensesLoadingSkeleton,
};
