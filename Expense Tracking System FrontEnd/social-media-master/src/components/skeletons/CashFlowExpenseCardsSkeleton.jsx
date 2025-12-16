import React from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const CashFlowExpenseCardsSkeleton = () => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "lg")
  );

  const columns = isMobile ? 1 : isTablet ? 3 : 5;
  const cardCount = isMobile ? 4 : isTablet ? 9 : 10;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: isMobile ? 1 : 2,
        overflow: "hidden",
      }}
    >
      {/* Header Skeleton (Date/Sort controls) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Skeleton
          variant="rounded"
          width={isMobile ? 100 : 150}
          height={36}
          sx={{ bgcolor: colors.hover_bg, borderRadius: 2 }}
        />
        <Skeleton
          variant="rounded"
          width={isMobile ? 80 : 120}
          height={36}
          sx={{ bgcolor: colors.hover_bg, borderRadius: 2 }}
        />
      </Box>

      {/* Expense Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: isMobile ? 1 : 1.5,
          width: "100%",
        }}
      >
        {Array.from({ length: cardCount }).map((_, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: colors.card_bg,
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
              padding: isMobile ? 1.25 : 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minHeight: 115,
            }}
          >
            {/* Title + Meta */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
            >
              <Skeleton
                variant="text"
                width="70%"
                height={18}
                sx={{ bgcolor: colors.hover_bg }}
              />
              <Skeleton
                variant="rounded"
                width={36}
                height={16}
                sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
              />
            </Box>

            {/* Amount Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: index % 3 === 0 ? "#ff4d4f26" : "#06d6a026",
                }}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={24}
                sx={{ bgcolor: colors.hover_bg }}
              />
            </Box>

            {/* Tags */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[60, 70, 50].map((width, tagIdx) => (
                <Skeleton
                  key={tagIdx}
                  variant="rounded"
                  width={width}
                  height={16}
                  sx={{ bgcolor: colors.hover_bg, borderRadius: 999 }}
                />
              ))}
            </Box>

            {/* Notes */}
            <Skeleton
              variant="text"
              width="90%"
              height={16}
              sx={{ bgcolor: colors.hover_bg, opacity: 0.7 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CashFlowExpenseCardsSkeleton;
