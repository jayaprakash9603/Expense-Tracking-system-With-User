import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useTheme } from "../hooks/useTheme";

/**
 * DayViewSkeleton - Reusable loader/empty placeholder for day-based views (transactions, bills)
 * Props:
 *  loading: boolean - whether data is being fetched
 *  isEmpty: boolean - whether there is no data after loading
 *  showAddHint: boolean - whether to display the hint to add a new item (only for users with write access)
 *  emptyTitle?: string - main empty state title (default: 'No records')
 *  emptySubtitle?: string - optional subtitle below the title
 *  iconSrc?: string - optional image path for empty state illustration
 */
const DayViewSkeleton = ({
  loading,
  isEmpty,
  showAddHint = false,
  emptyTitle = "No records!",
  emptySubtitle = "",
  iconSrc,
}) => {
  const { colors } = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 260,
              background: colors.secondary_bg,
              borderRadius: 2,
              p: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <Skeleton
              variant="text"
              width={140}
              height={20}
              sx={{ bgcolor: colors.hover_bg }}
            />
            <Skeleton
              variant="text"
              width={100}
              height={18}
              sx={{ bgcolor: colors.hover_bg }}
            />
            <Skeleton
              variant="rectangular"
              height={52}
              sx={{ mt: 1, borderRadius: 1, bgcolor: colors.hover_bg }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 4,
          position: "relative",
        }}
      >
        {iconSrc && (
          <img
            src={iconSrc}
            alt="empty"
            style={{
              width: 120,
              height: 120,
              marginBottom: 16,
              objectFit: "contain",
            }}
          />
        )}
        <Typography variant="h6" color={colors.primary_text} fontWeight={700}>
          {emptyTitle}
        </Typography>
        {emptySubtitle && (
          <Typography
            variant="body2"
            color={colors.secondary_text}
            sx={{ mt: 0.5 }}
          >
            {emptySubtitle}
          </Typography>
        )}
        {showAddHint && (
          <Typography
            variant="body2"
            color={colors.secondary_text}
            sx={{ mt: 0.5 }}
          >
            Click + to add one.
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

export default DayViewSkeleton;
