import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * FlowChartSkeleton
 * Skeleton loading state for flow page charts (pie chart, bar chart)
 * Used in CategoryFlow, PaymentMethodFlow, and similar flow pages
 */
const FlowChartSkeleton = ({ variant = "bar" }) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "lg"),
  );

  if (variant === "pie") {
    return (
      <Box
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
        {/* Pie Chart Circle */}
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
            sx={{
              bgcolor: colors.hover_bg,
              opacity: 0.6,
            }}
            animation="wave"
          />
          {/* Inner circle for donut effect */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              bgcolor: colors.primary_bg,
            }}
          />
        </Box>

        {/* Legend Items */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <Skeleton
                variant="rounded"
                width={12}
                height={12}
                sx={{ bgcolor: colors.hover_bg, borderRadius: "2px" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={isMobile ? 50 : 70}
                height={14}
                sx={{ bgcolor: colors.hover_bg }}
                animation="wave"
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Bar chart variant (default)
  const barCount = isMobile ? 6 : isTablet ? 8 : 12;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        position: "relative",
        padding: "10px",
      }}
    >
      {/* Y-Axis Labels */}
      <Box
        sx={{
          width: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: "30px",
          paddingRight: "8px",
          alignItems: "flex-end",
        }}
      >
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={28}
            height={12}
            sx={{ bgcolor: colors.hover_bg, opacity: 0.5 }}
            animation="wave"
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
          {[1, 2, 3, 4].map((_, i) => (
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

        {/* Bars */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            gap: isMobile ? 0.5 : 1,
            paddingBottom: "10px",
            zIndex: 1,
          }}
        >
          {Array.from({ length: barCount }).map((_, index) => {
            // Pseudo-random heights for visual variety
            const pseudoRandom = Math.abs(Math.sin(index * 7.5 + 42));
            const heightPercent = 25 + pseudoRandom * 65;

            return (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  maxWidth: 40,
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
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${index * 0.08}s`,
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* X-Axis Labels */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            paddingTop: "8px",
          }}
        >
          {Array.from({ length: Math.min(barCount, 6) }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={isMobile ? 20 : 30}
              height={12}
              sx={{ bgcolor: colors.hover_bg, opacity: 0.4 }}
              animation="wave"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FlowChartSkeleton;
