import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const skeletonMotionSx = {
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

const resolveBarCount = (activeRange, isMobile, isTablet) => {
  if (activeRange === "week") {
    return isMobile ? 7 : 7;
  }
  if (activeRange === "year") {
    return isMobile ? 6 : isTablet ? 10 : 12;
  }
  return isMobile ? 12 : isTablet ? 20 : 30;
};

const resolveXLabelCount = (barCount, isMobile) =>
  Math.min(isMobile ? 4 : 8, Math.max(4, Math.floor(barCount / 4)));

/**
 * Skeleton for flow page stacked bar charts (categories, payment methods).
 */
const FlowChartSkeleton = ({ variant = "bar", activeRange = "month" }) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "lg"),
  );

  const baseSx = {
    bgcolor: colors.hover_bg,
    ...skeletonMotionSx,
  };

  const barCount = resolveBarCount(activeRange, isMobile, isTablet);
  const xLabelCount = resolveXLabelCount(barCount, isMobile);

  if (variant === "pie") {
    return (
      <Box
        role="status"
        aria-label="Loading chart"
        aria-busy="true"
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          padding: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: isMobile ? 80 : isTablet ? 100 : 140,
            height: isMobile ? 80 : isTablet ? 100 : 140,
          }}
        >
          <Skeleton
            variant="circular"
            width="100%"
            height="100%"
            sx={{ ...baseSx, opacity: 0.6 }}
            animation="wave"
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-bg)",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton
                variant="rounded"
                width={12}
                height={12}
                sx={{ ...baseSx, borderRadius: "2px" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={isMobile ? 50 : 70}
                height={14}
                sx={baseSx}
                animation="wave"
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      role="status"
      aria-label="Loading chart"
      aria-busy="true"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        position: "relative",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: "30px",
          paddingRight: "8px",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={28}
            height={12}
            sx={{ ...baseSx, opacity: 0.5 }}
            animation="wave"
          />
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 30,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: "100%",
                height: "1px",
                bgcolor: colors.border_color,
                opacity: 0.15,
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 0.25 : 0.5,
            paddingBottom: "10px",
            zIndex: 1,
            minHeight: 0,
          }}
        >
          {Array.from({ length: barCount }).map((_, index) => {
            const pseudoRandom = Math.abs(Math.sin(index * 12.9898 + 78.233));
            const heightPercent = 20 + pseudoRandom * 70;

            return (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  minWidth: 0,
                  maxWidth: activeRange === "month" && !isMobile ? 12 : 40,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={`${heightPercent}%`}
                  width="100%"
                  animation="wave"
                  sx={{
                    ...baseSx,
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.6,
                  }}
                />
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            height: 20,
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "4px",
          }}
        >
          {Array.from({ length: xLabelCount }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={isMobile ? 20 : 30}
              height={12}
              sx={{ ...baseSx, opacity: 0.4 }}
              animation="wave"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FlowChartSkeleton;
