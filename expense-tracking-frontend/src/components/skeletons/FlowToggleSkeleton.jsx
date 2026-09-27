import React from "react";
import { Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const FlowToggleSkeleton = ({ isMobile }) => {
  const { colors } = useTheme();

  return (
    <Skeleton
      variant="rounded"
      width={isMobile ? 48 : 132}
      height={isMobile ? 36 : 40}
      animation="wave"
      role="status"
      aria-label="Loading flow summary"
      aria-busy="true"
      sx={{
        bgcolor: colors.hover_bg,
        opacity: 0.7,
        borderRadius: "8px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    />
  );
};

export default FlowToggleSkeleton;
