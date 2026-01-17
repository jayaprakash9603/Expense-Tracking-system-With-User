import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * DailySpendingSkeleton - Customizable skeleton loader for Daily Spending Pattern chart
 *
 * Props:
 * @param {string} title - Chart title (default: "📊 Daily Spending Pattern")
 * @param {number} height - Override chart body height
 * @param {boolean} showControls - Show time selector and toggle controls (default: true)
 * @param {boolean} showYAxis - Show Y-axis skeleton labels (default: true)
 * @param {boolean} showXAxis - Show X-axis skeleton labels (default: true)
 * @param {number} xAxisLabels - Number of X-axis labels to show (default: 8)
 * @param {number} yAxisLabels - Number of Y-axis labels to show (default: 5)
 * @param {string} variant - "line" | "area" | "bar" (affects skeleton shape, default: "area")
 */
const DailySpendingSkeleton = ({
  title = "📊 Daily Spending Pattern",
  height: overrideHeight,
  showControls = true,
  showYAxis = true,
  showXAxis = true,
  xAxisLabels = 8,
  yAxisLabels = 5,
  variant = "area",
}) => {
  const { colors, mode } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  // Responsive height calculation matching actual chart
  const computed = isMobile ? 180 : isTablet ? 220 : 260;
  const chartHeight = overrideHeight || computed;

  // Skeleton shimmer style
  const getSkeletonStyle = (customStyle = {}) => ({
    background:
      mode === "dark"
        ? "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)"
        : "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-shimmer 1.5s infinite",
    borderRadius: "4px",
    ...customStyle,
  });

  // Generate wave path for area/line skeleton
  const generateWavePath = () => {
    const points = [
      { x: 0, y: 70 },
      { x: 15, y: 40 },
      { x: 30, y: 55 },
      { x: 45, y: 30 },
      { x: 60, y: 50 },
      { x: 75, y: 20 },
      { x: 90, y: 45 },
      { x: 100, y: 60 },
    ];

    const pathD = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    return pathD;
  };

  return (
    <div
      className="chart-container daily-spending-chart skeleton"
      style={{
        backgroundColor: colors.secondary_bg,
        borderRadius: "12px",
        padding: isMobile ? "16px" : "20px",
      }}
    >
      {/* Header */}
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* Title */}
        <div
          style={{
            ...getSkeletonStyle(),
            height: "24px",
            width: isMobile ? "180px" : "240px",
          }}
        />

        {/* Controls */}
        {showControls && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* Time selector */}
            <div
              style={{
                ...getSkeletonStyle(),
                height: "32px",
                width: "100px",
                borderRadius: "6px",
              }}
            />
            {/* Toggle buttons */}
            <div style={{ display: "flex", gap: "4px" }}>
              <div
                style={{
                  ...getSkeletonStyle(),
                  height: "32px",
                  width: "50px",
                  borderRadius: "6px",
                }}
              />
              <div
                style={{
                  ...getSkeletonStyle(),
                  height: "32px",
                  width: "50px",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart Body */}
      <div
        className="chart-body"
        style={{
          display: "flex",
          height: chartHeight,
          position: "relative",
        }}
      >
        {/* Y-Axis Labels */}
        {showYAxis && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingRight: "12px",
              paddingBottom: showXAxis ? "24px" : "0",
            }}
          >
            {[...Array(yAxisLabels)].map((_, i) => (
              <div
                key={i}
                style={{
                  ...getSkeletonStyle(),
                  height: "12px",
                  width: "36px",
                }}
              />
            ))}
          </div>
        )}

        {/* Chart Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Grid Lines + Wave Area */}
          <div
            style={{
              flex: 1,
              position: "relative",
              borderLeft: `1px solid ${
                mode === "dark" ? "#2a2a2a" : "#e0e0e0"
              }`,
              borderBottom: `1px solid ${
                mode === "dark" ? "#2a2a2a" : "#e0e0e0"
              }`,
            }}
          >
            {/* Horizontal Grid Lines */}
            {[...Array(yAxisLabels - 1)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${((i + 1) / yAxisLabels) * 100}%`,
                  borderTop: `1px dashed ${
                    mode === "dark" ? "#2a2a2a" : "#e8e8e8"
                  }`,
                }}
              />
            ))}

            {/* Animated Wave SVG */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="skeletonGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={mode === "dark" ? "#3a3a3a" : "#d0d0d0"}
                  >
                    <animate
                      attributeName="offset"
                      values="-1;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop
                    offset="50%"
                    stopColor={mode === "dark" ? "#4a4a4a" : "#e8e8e8"}
                  >
                    <animate
                      attributeName="offset"
                      values="-0.5;1.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop
                    offset="100%"
                    stopColor={mode === "dark" ? "#3a3a3a" : "#d0d0d0"}
                  >
                    <animate
                      attributeName="offset"
                      values="0;2"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>

              {variant === "area" && (
                <path
                  d={`${generateWavePath()} L 100 100 L 0 100 Z`}
                  fill="url(#skeletonGradient)"
                  opacity="0.5"
                />
              )}
              <path
                d={generateWavePath()}
                fill="none"
                stroke="url(#skeletonGradient)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* X-Axis Labels */}
          {showXAxis && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "8px",
                height: "24px",
              }}
            >
              {[...Array(xAxisLabels)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...getSkeletonStyle(),
                    height: "12px",
                    width: "20px",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySpendingSkeleton;
