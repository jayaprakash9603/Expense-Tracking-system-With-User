import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * CategoryEditSkeleton
 * Structured skeleton placeholder used while loading Edit Category data.
 * Keeps layout dimensions stable to prevent layout shift.
 */
const CategoryEditSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div style={{ backgroundColor: colors.primary_bg }}>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)", // match real component
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          padding: 16,
          marginRight: 20,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Skeleton
            variant="text"
            width={220}
            height={40}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          height={2}
          sx={{ bgcolor: colors.border_color, mb: 2 }}
        />

        {/* Top three fields skeleton */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            mb: 1,
          }}
        >
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ flex: 1, bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ flex: 1, bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ flex: 1, bgcolor: colors.tertiary_bg }}
          />
        </Box>

        {/* Color & Icons panel skeleton */}
        <Grid container spacing={2} sx={{ mt: 1.5 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: `1px solid ${colors.border_color}`,
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                height: 180,
                overflow: "hidden",
                backgroundColor: colors.tertiary_bg,
              }}
            >
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ bgcolor: colors.hover_bg }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: `1px solid ${colors.border_color}`,
                borderRadius: 1,
                height: 180,
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                backgroundColor: colors.tertiary_bg,
              }}
            >
              <Skeleton
                variant="text"
                width="60%"
                height={32}
                sx={{ bgcolor: colors.hover_bg, mb: 1 }}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={45}
                    height={45}
                    sx={{ bgcolor: colors.hover_bg }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Global + Link expenses row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ bgcolor: colors.tertiary_bg }}
            />
            <Skeleton
              variant="text"
              width={260}
              height={28}
              sx={{ bgcolor: colors.tertiary_bg }}
            />
          </Box>
          <Skeleton
            variant="rounded"
            width={160}
            height={40}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>

        {/* Table placeholder */}
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rectangular"
            height={280}
            sx={{ bgcolor: colors.tertiary_bg, borderRadius: 2 }}
          />
        </Box>

        {/* Submit button placeholder */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Skeleton
            variant="rounded"
            width={160}
            height={40}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
      </div>
    </div>
  );
};

export default CategoryEditSkeleton;
