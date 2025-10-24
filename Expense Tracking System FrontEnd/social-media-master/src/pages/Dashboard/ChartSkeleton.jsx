import React from "react";
import { useTheme } from "../../hooks/useTheme";

// Reusable chart skeleton component extracted from ExpenseDashboard.jsx
// Props:
//  height: number (px)
//  variant: 'bar' | 'line' | 'pie'
//  noHeader: boolean - when true, omit header skeleton (useful when parent already renders header)
const ChartSkeleton = ({ height = 300, variant = "bar", noHeader = false }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`chart-skeleton variant-${variant}`}
      style={{
        height,
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {!noHeader && (
        <div className="skeleton-chart-header">
          <div
            className="skeleton-title"
            style={{ backgroundColor: colors.hover_bg }}
          ></div>
          <div
            className="skeleton-actions"
            style={{ backgroundColor: colors.hover_bg }}
          ></div>
        </div>
      )}
      <div className="skeleton-chart-body">
        {variant === "line" && (
          <div className="skeleton-line-body">
            <div
              className="skeleton-axis-x"
              style={{ backgroundColor: colors.border_color }}
            />
            <div
              className="skeleton-axis-y"
              style={{ backgroundColor: colors.border_color }}
            />
            <svg
              className="skeleton-line-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="skGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={`${colors.hover_bg}99`} />
                  <stop offset="50%" stopColor={`${colors.hover_bg}cc`} />
                  <stop offset="100%" stopColor={`${colors.hover_bg}99`} />
                </linearGradient>
              </defs>
              <path
                className="skeleton-area-fill"
                d="M0,70 L10,65 L20,72 L30,50 L40,58 L50,42 L60,52 L70,38 L80,46 L90,35 L100,40 L100,100 L0,100 Z"
                fill={`${colors.hover_bg}33`}
              />
              <polyline
                className="skeleton-line-path"
                points="0,70 10,65 20,72 30,50 40,58 50,42 60,52 70,38 80,46 90,35 100,40"
                stroke="url(#skGrad)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {variant === "pie" && (
          <div className="skeleton-pie-wrap">
            <div className="skeleton-legend">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: colors.hover_bg }}
                  />
                  <span
                    className="legend-text"
                    style={{ backgroundColor: colors.hover_bg }}
                  />
                </div>
              ))}
            </div>
            <svg
              className="skeleton-pie-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle
                cx="50"
                cy="50"
                r="32"
                stroke={`${colors.hover_bg}33`}
                strokeWidth="18"
                fill="none"
              />
              <circle
                className="skeleton-pie-ring"
                cx="50"
                cy="50"
                r="32"
                stroke={`${colors.hover_bg}99`}
                strokeWidth="18"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="40 10"
              />
            </svg>
            <div
              className="skeleton-total-pill"
              style={{ backgroundColor: colors.hover_bg }}
            />
          </div>
        )}
        {variant === "bar" && (
          <div className="skeleton-bars">
            <div
              className="skeleton-axis-x"
              style={{ backgroundColor: colors.border_color }}
            />
            <div
              className="skeleton-axis-y"
              style={{ backgroundColor: colors.border_color }}
            />
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="skeleton-bar"
                style={{
                  height: `${40 + (i % 5) * 8}%`,
                  backgroundColor: colors.hover_bg,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSkeleton;
