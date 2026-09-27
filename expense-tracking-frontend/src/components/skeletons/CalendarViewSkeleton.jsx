import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const motionSafe = {
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

const CalendarViewSkeleton = ({ isSmallScreen }) => {
  const { colors } = useTheme();
  const mqSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const small = isSmallScreen ?? mqSmall;
  const cellCount = 42;

  const baseSx = {
    bgcolor: colors.hover_bg,
    opacity: 0.55,
    ...motionSafe,
  };

  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading calendar"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: 1,
        minHeight: small ? 320 : 0,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 1,
          mb: 1,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={`wd-${i}`}
            variant="rounded"
            height={28}
            sx={{ ...baseSx, borderRadius: "8px" }}
            animation="wave"
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gridTemplateRows: small ? "auto" : "repeat(6, minmax(72px, 1fr))",
          gap: 1,
          flex: small ? "0 0 auto" : "1 1 auto",
          minHeight: small ? 360 : 0,
        }}
      >
        {Array.from({ length: cellCount }).map((_, i) => (
          <Skeleton
            key={`cell-${i}`}
            variant="rounded"
            height={small ? 72 : "100%"}
            sx={{
              ...baseSx,
              borderRadius: "10px",
              minHeight: 64,
            }}
            animation="wave"
          />
        ))}
      </Box>
    </Box>
  );
};

export default CalendarViewSkeleton;
