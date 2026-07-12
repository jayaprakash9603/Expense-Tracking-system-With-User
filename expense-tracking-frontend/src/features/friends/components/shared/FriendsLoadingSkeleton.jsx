import React from "react";
import { Box, Skeleton, Card, CardContent } from "@mui/material";
import { useTheme } from "../../../../hooks/useTheme";

const FriendsLoadingSkeleton = ({ count = 5, variant = "list" }) => {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";
  const skeletonBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";

  if (variant === "card") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card
            key={i}
            sx={{
              bgcolor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={56} height={56} sx={{ bgcolor: skeletonBg }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: skeletonBg }} />
                  <Skeleton variant="text" width="40%" height={16} sx={{ bgcolor: skeletonBg, mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: 1, bgcolor: skeletonBg }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: colors.card_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: 2,
          }}
        >
          <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: skeletonBg }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={24} sx={{ bgcolor: skeletonBg }} />
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 1, bgcolor: skeletonBg }} />
              <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: skeletonBg }} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: skeletonBg }} />
        </Box>
      ))}
    </Box>
  );
};

export default FriendsLoadingSkeleton;
