/**
 * =============================================================================
 * SharesPageSkeleton - Loading Skeleton for Share Pages
 * =============================================================================
 *
 * Reusable skeleton component for share listing pages.
 * Provides consistent loading states across MyShares, PublicShares,
 * and SharedWithMe pages.
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import { Box, Grid, Skeleton, Card, CardContent } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Skeleton Components
// =============================================================================

/**
 * Skeleton for statistics cards
 */
export const StatCardSkeleton = ({ count = 4 }) => {
  const { colors } = useTheme();

  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Card
            sx={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mx: "auto", bgcolor: colors.skeleton }}
              />
              <Skeleton
                variant="text"
                width="80%"
                height={20}
                sx={{ mx: "auto", bgcolor: colors.skeleton }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton for a single share card
 */
export const ShareCardSkeleton = ({ variant = "default" }) => {
  const { colors } = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              sx={{ bgcolor: colors.skeleton }}
            />
            <Box>
              <Skeleton
                variant="text"
                width={120}
                height={24}
                sx={{ bgcolor: colors.skeleton }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={18}
                sx={{ bgcolor: colors.skeleton }}
              />
            </Box>
          </Box>
          <Skeleton
            variant="rounded"
            width={70}
            height={24}
            sx={{ bgcolor: colors.skeleton }}
          />
        </Box>

        {/* Body */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: colors.backgroundSecondary,
            mb: 2,
          }}
        >
          <Skeleton
            variant="text"
            width="90%"
            height={20}
            sx={{ bgcolor: colors.skeleton }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            sx={{ bgcolor: colors.skeleton }}
          />
        </Box>

        {/* Footer */}
        {variant === "with-actions" && (
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={36}
              sx={{ bgcolor: colors.skeleton }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton for toolbar (tabs, search, etc.)
 */
export const ToolbarSkeleton = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Tabs skeleton */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={80}
            height={32}
            sx={{ bgcolor: colors.skeleton }}
          />
        ))}
      </Box>

      {/* Search & actions skeleton */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Skeleton
          variant="rounded"
          width={200}
          height={40}
          sx={{ bgcolor: colors.skeleton }}
        />
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          sx={{ bgcolor: colors.skeleton }}
        />
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          sx={{ bgcolor: colors.skeleton }}
        />
      </Box>
    </Box>
  );
};

/**
 * Skeleton for page header
 */
export const HeaderSkeleton = () => {
  const { colors } = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Skeleton
        variant="text"
        width={200}
        height={40}
        sx={{ bgcolor: colors.skeleton }}
      />
      <Skeleton
        variant="text"
        width={350}
        height={24}
        sx={{ bgcolor: colors.skeleton }}
      />
    </Box>
  );
};

// =============================================================================
// Main Skeleton Component
// =============================================================================

/**
 * Full page skeleton for shares pages
 * @param {Object} props
 * @param {number} props.cardCount - Number of card skeletons to show
 * @param {number} props.statCount - Number of stat card skeletons
 * @param {string} props.cardVariant - Card skeleton variant
 * @param {boolean} props.showHeader - Whether to show header skeleton
 * @param {boolean} props.showStats - Whether to show stats skeleton
 * @param {boolean} props.showToolbar - Whether to show toolbar skeleton
 * @param {string} props.viewMode - 'grid' or 'list'
 */
const SharesPageSkeleton = ({
  cardCount = 8,
  statCount = 4,
  cardVariant = "default",
  showHeader = true,
  showStats = true,
  showToolbar = true,
  viewMode = "grid",
}) => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        p: 3,
      }}
    >
      {/* Header */}
      {showHeader && <HeaderSkeleton />}

      {/* Statistics */}
      {showStats && (
        <Box sx={{ mb: 4 }}>
          <StatCardSkeleton count={statCount} />
        </Box>
      )}

      {/* Toolbar */}
      {showToolbar && <ToolbarSkeleton />}

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <Grid
            item
            xs={12}
            sm={viewMode === "list" ? 12 : 6}
            md={viewMode === "list" ? 12 : 4}
            lg={viewMode === "list" ? 12 : 3}
            key={index}
          >
            <ShareCardSkeleton variant={cardVariant} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SharesPageSkeleton;
