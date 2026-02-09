import React from "react";
import { useTheme } from "../hooks/useTheme";
import { useMediaQuery } from "@mui/material";

/**
 * SummaryOverviewSkeleton
 * Loading skeleton for the SummaryOverview component
 */
const SummaryOverviewSkeleton = () => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const shimmer = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `;

  const skeletonStyle = {
    background: `linear-gradient(90deg, ${colors.tertiary_bg} 0%, ${colors.border_color} 50%, ${colors.tertiary_bg} 100%)`,
    backgroundSize: "1000px 100%",
    animation: "shimmer 2s infinite linear",
    borderRadius: "8px",
  };

  return (
    <div
      className="chart-container summary-overview"
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      <style>{shimmer}</style>

      {/* Header Skeleton */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
          padding: "14px 24px",
          borderBottom: `1px solid ${colors.border_color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              ...skeletonStyle,
              width: "24px",
              height: "24px",
              borderRadius: "50%",
            }}
          />
          <div style={{ ...skeletonStyle, width: "180px", height: "18px" }} />
        </div>
        <div
          style={{
            ...skeletonStyle,
            width: "110px",
            height: "28px",
            borderRadius: "20px",
          }}
        />
      </div>

      {/* Metrics Grid Skeleton */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
            gap: "12px",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                background: colors.tertiary_bg,
                borderRadius: "12px",
                padding: "16px 12px",
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div
                style={{
                  ...skeletonStyle,
                  width: "24px",
                  height: "24px",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{
                  ...skeletonStyle,
                  width: "80%",
                  height: "11px",
                  marginBottom: "8px",
                }}
              />
              <div style={{ ...skeletonStyle, width: "60%", height: "18px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div style={{ padding: "0 24px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: colors.tertiary_bg,
                borderRadius: "12px",
                padding: "16px",
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    ...skeletonStyle,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                  }}
                />
                <div
                  style={{ ...skeletonStyle, width: "100px", height: "12px" }}
                />
              </div>
              <div
                style={{
                  ...skeletonStyle,
                  width: "50%",
                  height: "24px",
                  marginBottom: "8px",
                }}
              />
              <div style={{ ...skeletonStyle, width: "70%", height: "11px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Top Expenses Skeleton */}
      <div style={{ padding: "0 24px 24px" }}>
        <div
          style={{
            background: colors.tertiary_bg,
            borderRadius: "12px",
            border: `1px solid ${colors.border_color}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${colors.border_color}`,
              background: `linear-gradient(135deg, ${colors.primary_accent}08 0%, transparent 100%)`,
            }}
          >
            <div style={{ ...skeletonStyle, width: "120px", height: "14px" }} />
          </div>
          <div
            style={{
              padding: "8px",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      ...skeletonStyle,
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        ...skeletonStyle,
                        width: "80%",
                        height: "13px",
                        marginBottom: "4px",
                      }}
                    />
                    <div
                      style={{ ...skeletonStyle, width: "40%", height: "10px" }}
                    />
                  </div>
                </div>
                <div
                  style={{ ...skeletonStyle, width: "60px", height: "14px" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryOverviewSkeleton;
