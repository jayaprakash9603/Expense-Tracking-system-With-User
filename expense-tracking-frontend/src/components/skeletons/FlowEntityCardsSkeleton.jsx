import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * FlowEntityCardsSkeleton
 * Skeleton loading state for FlowEntityCards component
 * Used in CategoryFlow, PaymentMethodFlow, and similar flow pages
 */
const FlowEntityCardsSkeleton = ({ cardCount = 6 }) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "lg"),
  );

  const displayCount = isMobile ? 2 : isTablet ? 4 : cardCount;
  const cardWidth = isMobile ? "100%" : 220;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: isMobile ? 1 : 2,
        maxHeight: isMobile ? 200 : isTablet ? 250 : 360,
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: isMobile ? "4px" : isTablet ? "8px" : "16px",
        paddingLeft: "16px",
        width: "100%",
      }}
      className="custom-scrollbar"
    >
      {Array.from({ length: displayCount }).map((_, index) => (
        <Box
          key={index}
          sx={{
            width: cardWidth,
            minWidth: isMobile ? "100%" : 200,
            maxWidth: isMobile ? "100%" : 240,
            height: 130,
            bgcolor: colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
            padding: isMobile ? 1.5 : 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            marginBottom: "16px",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {/* Header Row - Icon + Name + Menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Category/Payment Method Icon */}
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ bgcolor: colors.hover_bg }}
                animation="wave"
              />
              {/* Entity Name */}
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: colors.hover_bg }}
                animation="wave"
              />
            </Box>
            {/* Menu Icon */}
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ bgcolor: colors.hover_bg, opacity: 0.5 }}
              animation="wave"
            />
          </Box>

          {/* Amount Row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="rounded"
              width={90}
              height={28}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
              animation="wave"
            />
          </Box>

          {/* Footer Row - Expense Count Badge */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
            }}
          >
            <Skeleton
              variant="rounded"
              width={80}
              height={20}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1, opacity: 0.6 }}
              animation="wave"
            />
            {/* Color indicator */}
            <Skeleton
              variant="rounded"
              width={4}
              height={40}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
              animation="wave"
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FlowEntityCardsSkeleton;
