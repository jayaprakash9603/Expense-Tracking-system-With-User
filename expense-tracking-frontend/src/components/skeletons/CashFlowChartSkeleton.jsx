import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const CashFlowChartSkeleton = () => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  // Number of bars to simulate based on screen size
  const barCount = isMobile ? 12 : 30;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row", // Horizontal layout for Y-axis + Chart
        position: "relative",
        padding: "10px",
      }}
    >
      {/* Y-Axis Labels Skeleton */}
      <Box
        sx={{
          width: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: "30px", // Space for X-axis
          paddingRight: "8px",
          alignItems: "flex-end",
        }}
      >
        {[1, 2, 3, 4, 5].map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={30}
            height={12}
            sx={{ bgcolor: colors.hover_bg, opacity: 0.5 }}
          />
        ))}
      </Box>

      {/* Chart Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Grid Lines */}
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
          }}
        >
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: "100%",
                height: "1px",
                bgcolor: colors.border_color,
                opacity: 0.2,
              }}
            />
          ))}
        </Box>

        {/* Bars */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 0.5 : 1,
            paddingBottom: "10px",
            zIndex: 1,
          }}
        >
          {Array.from({ length: barCount }).map((_, index) => {
            const pseudoRandom = Math.abs(Math.sin(index * 12.9898 + 78.233));
            const heightPercent = 20 + pseudoRandom * 70;

            return (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={`${heightPercent}%`}
                  width="100%"
                  animation="wave"
                  sx={{
                    bgcolor: colors.hover_bg,
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.6,
                    // Staggered animation effect
                    animation: "growUp 1.5s ease-out infinite",
                    animationDelay: `${index * 0.05}s`,
                    transformOrigin: "bottom",
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* X-Axis Labels */}
        <Box
          sx={{
            height: "20px",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "4px",
          }}
        >
          {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={30}
              height={12}
              sx={{ bgcolor: colors.hover_bg, opacity: 0.5 }}
            />
          ))}
        </Box>
      </Box>
      <style>
        {`
          @keyframes growUp {
            0% { transform: scaleY(0.1); opacity: 0.3; }
            50% { transform: scaleY(1); opacity: 0.8; }
            100% { transform: scaleY(0.1); opacity: 0.3; }
          }
        `}
      </style>
    </Box>
  );
};

export default CashFlowChartSkeleton;
