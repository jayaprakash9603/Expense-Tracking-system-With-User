import React from "react";
import { useTheme } from "../../hooks/useTheme";

// BudgetOverviewSkeleton supports two modes:
//  summary: circle progress + two metric lines (Remaining / Total Spent)
//  list: multiple budget rows with bar + metrics (count controls rows)
// isCompact: boolean - if true, uses compact sizing for smaller layouts
const BudgetOverviewSkeleton = ({
  mode = "summary",
  count = 4,
  isCompact = false,
}) => {
  const { colors, theme } = useTheme();
  const effectiveCount = isCompact ? Math.min(count, 3) : count;

  // Theme-aware shimmer colors
  const shimmerBase =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const shimmerHighlight =
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const shimmerPeak =
    theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const ringColor =
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  // Inline keyframes for shimmer animation
  const shimmerKeyframes = `
    @keyframes skeletonShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes skeletonPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes skeletonRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const shimmerStyle = {
    background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerPeak} 50%, ${shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "skeletonShimmer 1.8s ease-in-out infinite",
  };

  const pulseStyle = {
    animation: "skeletonPulse 1.6s ease-in-out infinite",
  };

  // Common container styles
  const containerStyle = {
    backgroundColor: colors.secondary_bg,
    border: `1px solid ${colors.border_color}`,
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  if (mode === "summary") {
    return (
      <>
        <style>{shimmerKeyframes}</style>
        <div
          className={`budget-overview skeleton summary ${isCompact ? "compact" : ""}`}
          style={containerStyle}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: "1.25rem", ...pulseStyle }}>🎯</span>
            <div
              style={{
                width: 140,
                height: 20,
                borderRadius: 6,
                ...shimmerStyle,
              }}
            />
          </div>

          {/* Circle Progress */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px 0",
              flex: 1,
            }}
          >
            <div
              style={{
                position: "relative",
                width: isCompact ? 140 : 180,
                height: isCompact ? 140 : 180,
              }}
            >
              {/* Outer ring with gradient */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  animation: "skeletonRotate 3s linear infinite",
                }}
              >
                <defs>
                  <linearGradient
                    id="ringGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={shimmerPeak} />
                    <stop offset="50%" stopColor={shimmerBase} />
                    <stop offset="100%" stopColor={shimmerPeak} />
                  </linearGradient>
                </defs>
                <circle
                  cx="90"
                  cy="90"
                  r="78"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="12"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="78"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="12"
                  strokeDasharray="120 370"
                  strokeLinecap="round"
                />
              </svg>
              {/* Center content */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: colors.tertiary_bg,
                  borderRadius: "50%",
                  width: isCompact ? 100 : 130,
                  height: isCompact ? 100 : 130,
                  justifyContent: "center",
                  border: `2px solid ${colors.border_color}`,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 24,
                    borderRadius: 6,
                    ...shimmerStyle,
                  }}
                />
                <div
                  style={{
                    width: 36,
                    height: 14,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: "0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Budget Details Cards */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
            }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: colors.tertiary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: "60%",
                      height: 12,
                      borderRadius: 4,
                      ...shimmerStyle,
                      animationDelay: `${i * 0.15 + 0.1}s`,
                    }}
                  />
                  <div
                    style={{
                      width: "80%",
                      height: 16,
                      borderRadius: 4,
                      ...shimmerStyle,
                      animationDelay: `${i * 0.15 + 0.2}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // List mode skeleton
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className={`budget-overview skeleton list ${isCompact ? "compact" : ""}`}
        style={containerStyle}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.25rem", ...pulseStyle }}>📊</span>
            <div
              style={{
                width: 140,
                height: 20,
                borderRadius: 6,
                ...shimmerStyle,
              }}
            />
          </div>
          <div
            style={{
              width: 90,
              height: 32,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
        </div>

        {/* Budget List Items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
          }}
        >
          {Array.from({ length: effectiveCount }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: colors.tertiary_bg,
                border: `1px solid ${colors.border_color}`,
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Budget Header Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      ...shimmerStyle,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                  <div
                    style={{
                      width: 100 + (i % 3) * 20,
                      height: 14,
                      borderRadius: 4,
                      ...shimmerStyle,
                      animationDelay: `${i * 0.1 + 0.05}s`,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 48,
                    height: 22,
                    borderRadius: 6,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.1}s`,
                  }}
                />
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 4,
                  overflow: "hidden",
                  backgroundColor: shimmerBase,
                }}
              >
                <div
                  style={{
                    width: `${30 + (i % 4) * 15}%`,
                    height: "100%",
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.15}s`,
                  }}
                />
              </div>

              {/* Metrics Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 11,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.2}s`,
                  }}
                />
                <div
                  style={{
                    width: 70,
                    height: 11,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.25}s`,
                  }}
                />
                <div
                  style={{
                    width: 90,
                    height: 11,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.3}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BudgetOverviewSkeleton;
