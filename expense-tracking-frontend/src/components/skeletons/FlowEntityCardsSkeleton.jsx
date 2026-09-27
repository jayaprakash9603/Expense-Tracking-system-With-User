import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const skeletonMotionSx = {
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

/**
 * Skeleton loading state for FlowEntityCards (category / payment method cards).
 */
const FlowEntityCardsSkeleton = ({ isMobile, isTablet, cardCount }) => {
  const { colors } = useTheme();
  const mqMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const mqTablet = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "md"),
  );
  const mobile = isMobile ?? mqMobile;
  const tablet = isTablet ?? mqTablet;

  const displayCount =
    cardCount ?? (mobile ? 4 : tablet ? 8 : 12);

  const cardWidth = mobile ? "100%" : tablet ? "calc(50% - 12px)" : 220;
  const maxWidth = mobile ? "100%" : tablet ? "calc(50% - 12px)" : 220;

  const baseSx = {
    bgcolor: colors.hover_bg,
    ...skeletonMotionSx,
  };

  return (
    <Box
      role="status"
      aria-label="Loading categories"
      aria-busy="true"
      className="custom-scrollbar"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: mobile ? "10px" : "12px",
        maxHeight: mobile ? "none" : tablet ? 280 : 360,
        minHeight: mobile ? 280 : tablet ? 280 : 360,
        overflowY: mobile ? "visible" : "auto",
        overflowX: "hidden",
        paddingRight: mobile ? "4px" : tablet ? "8px" : "16px",
        paddingLeft: mobile ? "8px" : "16px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: displayCount }).map((_, index) => (
        <Box
          key={index}
          sx={{
            width: cardWidth,
            minWidth: mobile ? "100%" : 200,
            maxWidth,
            height: 130,
            minHeight: 130,
            maxHeight: 130,
            bgcolor: colors.primary_bg,
            borderRadius: "8px",
            border: `1px solid ${colors.border_color}`,
            borderLeft: `6px solid ${colors.hover_bg}`,
            padding: mobile ? "14px 16px" : "16px 20px",
            boxSizing: "border-box",
            margin: mobile ? 0 : "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                sx={baseSx}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={mobile ? 100 : 88}
                height={20}
                sx={{ ...baseSx, flexShrink: 0 }}
                animation="wave"
              />
            </Box>
            <Skeleton
              variant="circular"
              width={28}
              height={28}
              sx={{ ...baseSx, opacity: 0.5, flexShrink: 0 }}
              animation="wave"
            />
          </Box>

          <Skeleton
            variant="text"
            width={mobile ? "45%" : 96}
            height={28}
            sx={{ ...baseSx, mt: 0.5 }}
            animation="wave"
          />

          <Skeleton
            variant="text"
            width={mobile ? "55%" : 112}
            height={18}
            sx={{ ...baseSx, opacity: 0.55, mt: "auto" }}
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );
};

export default FlowEntityCardsSkeleton;
