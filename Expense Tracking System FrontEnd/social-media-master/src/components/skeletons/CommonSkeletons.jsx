import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { DailySpendingSkeleton } from "../../pages/Dashboard";

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
        className="header-center"
        style={{
          flex: "1 1 220px",
          minWidth: 220,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="skeleton-date-range"
          style={{
            width: 280,
            height: 48,
            borderRadius: "999px",
            ...getSkeletonStyle(mode),
            opacity: 0.5,
          }}
        />
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
              width: i < 2 ? "100px" : "90px",
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

export const RecurringLossGainCardsSkeleton = ({ rows = 5 }) => {
  const { colors, mode } = useTheme();

  const containerStyle = {
    background: colors.primary_bg,
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "20px",
  };

  const headerTitleStyle = {
    height: 18,
    width: 220,
    ...getSkeletonStyle(mode),
    borderRadius: 6,
    marginBottom: 8,
    opacity: 0.7,
  };

  const headerSubtitleStyle = {
    height: 14,
    width: 280,
    ...getSkeletonStyle(mode),
    borderRadius: 6,
    opacity: 0.45,
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    background: colors.secondary_bg,
    border: `1px solid ${colors.border_color}`,
    borderRadius: 12,
  };

  return (
    <>
      {/* Top Recurring Expenses skeleton */}
      <div className="chart-container skeleton" style={containerStyle}>
        <div className="chart-header" style={{ marginBottom: 14 }}>
          <div className="skeleton" style={headerTitleStyle} />
          <div className="skeleton" style={headerSubtitleStyle} />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {[...Array(rows)].map((_, i) => (
            <div key={i} style={rowStyle}>
              <div
                className="skeleton"
                style={{
                  height: 14,
                  width: "46%",
                  ...getSkeletonStyle(mode),
                  borderRadius: 6,
                  opacity: 0.55,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 20,
                  width: 56,
                  ...getSkeletonStyle(mode),
                  borderRadius: 999,
                  opacity: 0.45,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 16,
                  width: 92,
                  ...getSkeletonStyle(mode),
                  borderRadius: 6,
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Loss vs Gain breakdown skeleton */}
      <div className="chart-container skeleton" style={containerStyle}>
        <div className="chart-header" style={{ marginBottom: 14 }}>
          <div className="skeleton" style={headerTitleStyle} />
          <div className="skeleton" style={headerSubtitleStyle} />
        </div>

        <div
          style={{
            height: 220,
            borderRadius: 12,
            border: `1px solid ${colors.border_color}`,
            background: colors.secondary_bg,
            padding: 16,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <div
            className="skeleton"
            style={{
              height: "75%",
              width: 52,
              ...getSkeletonStyle(mode),
              borderRadius: "8px 8px 4px 4px",
              opacity: 0.55,
            }}
          />
          <div
            className="skeleton"
            style={{
              height: "55%",
              width: 52,
              ...getSkeletonStyle(mode),
              borderRadius: "8px 8px 4px 4px",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Legend line */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <div
            className="skeleton"
            style={{
              height: 12,
              width: 220,
              ...getSkeletonStyle(mode),
              borderRadius: 6,
              opacity: 0.35,
            }}
          />
        </div>

        {/* Summary pills row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 12,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 34,
                width: 140,
                ...getSkeletonStyle(mode),
                borderRadius: 999,
                opacity: 0.4,
                flex: "0 0 auto",
              }}
            />
          ))}
        </div>
      </div>
    </>
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

export const BudgetOverviewCardSkeleton = () => {
  const { colors, mode } = useTheme();

  return (
    <div
      className="budget-card skeleton"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: 10,
        padding: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top indicator bar */}
      <div
        className="skeleton"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          ...getSkeletonStyle(mode),
          borderRadius: 0,
        }}
      />

      {/* Header: title + date badge */}
      <div style={{ marginBottom: 12, marginTop: 6 }}>
        <div
          className="skeleton"
          style={{
            height: 16,
            width: "72%",
            ...getSkeletonStyle(mode),
            marginBottom: 10,
            borderRadius: 6,
          }}
        />
        <div
          className="skeleton"
          style={{
            height: 20,
            width: "62%",
            ...getSkeletonStyle(mode),
            borderRadius: 6,
            opacity: 0.85,
          }}
        />
      </div>

      {/* Utilization row + progress */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            gap: 10,
          }}
        >
          <div
            className="skeleton"
            style={{
              height: 12,
              width: 70,
              ...getSkeletonStyle(mode),
              borderRadius: 6,
            }}
          />
          <div
            className="skeleton"
            style={{
              height: 12,
              width: 44,
              ...getSkeletonStyle(mode),
              borderRadius: 6,
            }}
          />
        </div>
        <div
          className="skeleton"
          style={{
            height: 6,
            width: "100%",
            ...getSkeletonStyle(mode),
            borderRadius: 999,
            opacity: 0.55,
          }}
        />
      </div>

      {/* Stats grid: spent + allocated */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              padding: 8,
              borderRadius: 6,
              background: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <div
              className="skeleton"
              style={{
                height: 10,
                width: 60,
                ...getSkeletonStyle(mode),
                borderRadius: 6,
                marginBottom: 6,
              }}
            />
            <div
              className="skeleton"
              style={{
                height: 14,
                width: "70%",
                ...getSkeletonStyle(mode),
                borderRadius: 6,
              }}
            />
          </div>
        ))}
      </div>

      {/* Remaining row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 8,
          borderRadius: 6,
          background: colors.tertiary_bg,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <div
          className="skeleton"
          style={{
            height: 12,
            width: 90,
            ...getSkeletonStyle(mode),
            borderRadius: 6,
          }}
        />
        <div
          className="skeleton"
          style={{
            height: 12,
            width: 70,
            ...getSkeletonStyle(mode),
            borderRadius: 6,
          }}
        />
      </div>

      {/* Transactions row */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${colors.border_color}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          className="skeleton"
          style={{
            height: 12,
            width: 86,
            ...getSkeletonStyle(mode),
            borderRadius: 6,
          }}
        />
        <div
          className="skeleton"
          style={{
            height: 12,
            width: 26,
            ...getSkeletonStyle(mode),
            borderRadius: 6,
          }}
        />
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

export const AllBudgetsLoadingSkeleton = () => {
  const { colors, mode } = useTheme();

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
      <div className="charts-grid">
        {/* Top recurring + loss/gain row (side-by-side) */}
        <div className="chart-row">
          <RecurringLossGainCardsSkeleton />
        </div>

        {/* Daily spending pattern */}
        <div className="chart-row full-width">
          <DailySpendingSkeleton height={300} />
        </div>

        {/* Category Distribution */}
        <div className="chart-row full-width">
          <PieChartSkeleton height={360} />
        </div>

        {/* Payment Method Distribution */}
        <div className="chart-row full-width">
          <PieChartSkeleton height={360} />
        </div>

        {/* Budget Overview cards skeleton */}
        <div className="chart-row full-width">
          <div
            className="chart-container"
            style={{
              background: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <div className="chart-header" style={{ marginBottom: 20 }}>
              <div
                className="skeleton"
                style={{
                  height: 18,
                  width: 220,
                  ...getSkeletonStyle(mode),
                  borderRadius: 6,
                  opacity: 0.6,
                  marginBottom: 8,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 14,
                  width: 320,
                  ...getSkeletonStyle(mode),
                  borderRadius: 6,
                  opacity: 0.4,
                }}
              />
            </div>

            <div
              className="budget-overview-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
                padding: 4,
              }}
            >
              {[...Array(4)].map((_, i) => (
                <BudgetOverviewCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="chart-row full-width">
          <AccordionSkeleton items={8} />
        </div>
      </div>
    </div>
  );
};

// Budget-specific loading skeleton combining header, overview, category/payment distributions, and expenses accordion
export const BudgetReportLoadingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="budget-report" style={{ background: colors.secondary_bg }}>
      <ReportHeaderSkeleton rootClassName="budget-report-header" />
      <div className="budget-overview-cards">
        {[...Array(4)].map((_, i) => (
          <OverviewCardSkeleton key={i} />
        ))}
      </div>

      {/* Category + Payment distributions */}
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
          <AccordionSkeleton items={8} />
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
        <div className="chart-row full-width">
          <DailySpendingSkeleton height={200} />
        </div>

        <div className="chart-row">
          <PieChartSkeleton height={360} />
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

export default {
  HeaderSkeleton,
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  RecurringLossGainCardsSkeleton,
  TableSkeleton,
  AccordionSkeleton,
  CategoryLoadingSkeleton,
  PaymentLoadingSkeleton,
  BudgetReportLoadingSkeleton,
  ExpensesLoadingSkeleton,
};
