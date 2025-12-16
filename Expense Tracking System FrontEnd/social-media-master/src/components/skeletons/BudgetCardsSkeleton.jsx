import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const BudgetCardsSkeleton = ({ cardCount = 6, isMediumScreen = false }) => {
  const { colors } = useTheme();

  return (
    <Grid container spacing={2}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <Grid item xs={12} sm={6} md={isMediumScreen ? 6 : 4} key={index}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.tertiary_bg} 100%)`,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              padding: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={28}
                  sx={{ bgcolor: colors.hover_bg }}
                />
                <Skeleton
                  variant="text"
                  width="45%"
                  height={18}
                  sx={{ bgcolor: colors.hover_bg, opacity: 0.8 }}
                />
              </Box>
              <Skeleton
                variant="rounded"
                width={70}
                height={24}
                sx={{ bgcolor: colors.hover_bg, borderRadius: 999 }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Skeleton
                variant="text"
                width="50%"
                height={20}
                sx={{ bgcolor: colors.hover_bg }}
              />
              <Skeleton
                variant="text"
                width={60}
                height={18}
                sx={{ bgcolor: colors.hover_bg }}
              />
            </Box>

            <Skeleton
              variant="rectangular"
              height={8}
              sx={{
                width: "100%",
                borderRadius: 4,
                bgcolor: colors.hover_bg,
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton
                variant="text"
                width="55%"
                height={18}
                sx={{ bgcolor: colors.hover_bg, opacity: 0.9 }}
              />
              <Skeleton
                variant="text"
                width="35%"
                height={18}
                sx={{ bgcolor: colors.hover_bg, opacity: 0.9 }}
              />
            </Box>

            <Box
              sx={{
                borderTop: `1px solid ${colors.border_color}`,
                paddingTop: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                sx={{ bgcolor: colors.hover_bg }}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={16}
                sx={{ bgcolor: colors.hover_bg }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Skeleton
                variant="rounded"
                width={120}
                height={32}
                sx={{ bgcolor: colors.hover_bg, borderRadius: 2 }}
              />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default BudgetCardsSkeleton;
