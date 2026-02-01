import React from "react";
import { useTheme } from "../../hooks/useTheme";

// Skeleton for Recent Transactions
// Renders a grid with 'rows' rows and 'perRow' cards each (default 5 x 2 = 10 cards)
// If a 'count' prop is provided it is ignored in favor of rows*perRow to keep layout consistent.
// isCompact: boolean - if true, renders fewer items for compact layouts
const RecentTransactionsSkeleton = ({
  rows = 5,
  perRow = 2,
  count,
  isCompact = false,
}) => {
  const { colors, theme } = useTheme();
  // Use count if provided, otherwise calculate from rows*perRow
  const effectiveRows = isCompact ? Math.min(rows, 3) : rows;
  const total = count
    ? Math.min(count, isCompact ? 6 : 10)
    : effectiveRows * perRow;
  const items = Array.from({ length: total });

  // Theme-aware shimmer colors
  const shimmerBase =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const shimmerHighlight =
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const shimmerPeak =
    theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

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
  `;

  const shimmerStyle = {
    background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerPeak} 50%, ${shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "skeletonShimmer 1.8s ease-in-out infinite",
  };

  const pulseStyle = {
    animation: "skeletonPulse 1.6s ease-in-out infinite",
  };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className={`recent-transactions skeleton ${isCompact ? "compact" : ""}`}
        style={{
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 16,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.25rem", ...pulseStyle }}>🕒</span>
            <div
              style={{
                width: 160,
                height: 20,
                borderRadius: 6,
                ...shimmerStyle,
              }}
            />
          </div>
          <div
            style={{
              width: 80,
              height: 32,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
        </div>

        {/* Transaction List Grid */}
        <div
          className="transactions-list skeleton-grid"
          style={{
            display: "grid",
            gridTemplateColumns: isCompact ? "1fr" : "repeat(2, 1fr)",
            gap: "10px 12px",
            flex: 1,
          }}
        >
          {items.map((_, i) => (
            <div
              key={i}
              className="transaction-item skeleton-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                backgroundColor: colors.tertiary_bg,
                border: `1px solid ${colors.border_color}`,
                borderRadius: 12,
                minHeight: 68,
                transition: "all 0.3s ease",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              {/* Icon Circle */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  ...shimmerStyle,
                  animationDelay: `${i * 0.1}s`,
                }}
              />

              {/* Details */}
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
                    width: `${65 + (i % 3) * 10}%`,
                    height: 13,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.1}s`,
                  }}
                />
                <div
                  style={{
                    width: `${45 + (i % 2) * 15}%`,
                    height: 10,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.2}s`,
                  }}
                />
                <div
                  style={{
                    width: `${35 + (i % 4) * 5}%`,
                    height: 9,
                    borderRadius: 4,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1 + 0.3}s`,
                  }}
                />
              </div>

              {/* Amount Pill */}
              <div
                style={{
                  width: 56,
                  height: 24,
                  borderRadius: 6,
                  flexShrink: 0,
                  ...shimmerStyle,
                  animationDelay: `${i * 0.1 + 0.15}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RecentTransactionsSkeleton;
