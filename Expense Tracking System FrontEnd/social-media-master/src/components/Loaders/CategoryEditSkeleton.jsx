import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";

/**
 * CategoryEditSkeleton
 * Structured skeleton placeholder used while loading Edit Category data.
 * Keeps layout dimensions stable to prevent layout shift.
 */
const CategoryEditSkeleton = () => {
  return (
    <div className="bg-[#1b1b1b]">
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)", // match real component
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          border: "1px solid rgb(0,0,0)",
          padding: 16,
          marginRight: 20,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Skeleton
            variant="text"
            width={220}
            height={40}
            sx={{ bgcolor: "#2a2a2a" }}
          />
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{ bgcolor: "#2a2a2a" }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          height={2}
          sx={{ bgcolor: "#2f2f2f", mb: 2 }}
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
            sx={{ flex: 1, bgcolor: "#252525" }}
          />
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ flex: 1, bgcolor: "#252525" }}
          />
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ flex: 1, bgcolor: "#252525" }}
          />
        </Box>

        {/* Color & Icons panel skeleton */}
        <Grid container spacing={2} sx={{ mt: 1.5 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #2a2a2a",
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                height: 180,
                overflow: "hidden",
              }}
            >
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ bgcolor: "#2d2d2d" }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #2a2a2a",
                borderRadius: 1,
                height: 180,
                p: 1.5,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton
                variant="text"
                width="60%"
                height={32}
                sx={{ bgcolor: "#2a2a2a", mb: 1 }}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={45}
                    height={45}
                    sx={{ bgcolor: "#252525" }}
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
              sx={{ bgcolor: "#2d2d2d" }}
            />
            <Skeleton
              variant="text"
              width={260}
              height={28}
              sx={{ bgcolor: "#2a2a2a" }}
            />
          </Box>
          <Skeleton
            variant="rounded"
            width={160}
            height={40}
            sx={{ bgcolor: "#252525" }}
          />
        </Box>

        {/* Table placeholder */}
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rectangular"
            height={280}
            sx={{ bgcolor: "#1f1f1f", borderRadius: 2 }}
          />
        </Box>

        {/* Submit button placeholder */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Skeleton
            variant="rounded"
            width={160}
            height={40}
            sx={{ bgcolor: "#252525" }}
          />
        </Box>
      </div>
    </div>
  );
};

export default CategoryEditSkeleton;
