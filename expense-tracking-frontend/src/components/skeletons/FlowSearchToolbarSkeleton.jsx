import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Placeholder for SearchNavigationBar on flow pages (categories, payment methods).
 */
const FlowSearchToolbarSkeleton = ({ isMobile, isTablet }) => {
  const { colors } = useTheme();
  const mqMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isSmall = isMobile !== undefined ? isMobile : mqMobile;

  const baseSx = {
    bgcolor: colors.hover_bg,
    opacity: 0.65,
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  };

  const navButtonCount = isSmall ? 3 : isTablet ? 5 : 7;

  return (
    <Box
      role="status"
      aria-label="Loading search and actions"
      aria-busy="true"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: isSmall ? "wrap" : "nowrap",
        gap: isSmall ? 1 : 1.5,
        width: "100%",
        mt: 1,
        mb: 1,
      }}
    >
      <Skeleton
        variant="rounded"
        height={isSmall ? 40 : 44}
        sx={{
          ...baseSx,
          flex: isSmall ? "1 1 100%" : "0 1 280px",
          minWidth: isSmall ? "100%" : 200,
          maxWidth: isSmall ? "100%" : 360,
          borderRadius: "8px",
        }}
        animation="wave"
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flex: 1,
          flexWrap: isSmall ? "wrap" : "nowrap",
          justifyContent: isSmall ? "flex-start" : "flex-end",
          minWidth: 0,
        }}
      >
        {Array.from({ length: navButtonCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width={isSmall ? 72 : 88}
            height={36}
            sx={{ ...baseSx, borderRadius: "8px", flexShrink: 0 }}
            animation="wave"
          />
        ))}
        <Skeleton
          variant="rounded"
          width={isSmall ? 96 : 108}
          height={36}
          sx={{
            ...baseSx,
            borderRadius: "8px",
            flexShrink: 0,
            opacity: 0.85,
          }}
          animation="wave"
        />
      </Box>
    </Box>
  );
};

export default FlowSearchToolbarSkeleton;
