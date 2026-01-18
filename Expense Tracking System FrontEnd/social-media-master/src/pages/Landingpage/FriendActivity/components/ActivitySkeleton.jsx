/**
 * ActivitySkeleton Component
 * Loading skeleton for activity components.
 */

import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useTheme } from "../../../../hooks/useTheme";

/**
 * Skeleton for individual activity card
 */
const ActivityCardSkeleton = ({ compact = false }) => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: compact ? 1.5 : 2,
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Avatar */}
      <Skeleton
        variant="circular"
        width={compact ? 36 : 44}
        height={compact ? 36 : 44}
        sx={{ bgcolor: colors.tertiary_bg }}
      />

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Skeleton
            variant="text"
            width={100}
            height={20}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            width={60}
            height={20}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            width={50}
            height={20}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>

        {/* Description */}
        <Skeleton
          variant="text"
          width="90%"
          height={18}
          sx={{ bgcolor: colors.tertiary_bg, mb: 0.5 }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={18}
          sx={{ bgcolor: colors.tertiary_bg }}
        />

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Skeleton
            variant="text"
            width={80}
            height={16}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="text"
            width={60}
            height={16}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
      </Box>

      {/* Action */}
      <Skeleton
        variant="circular"
        width={24}
        height={24}
        sx={{ bgcolor: colors.tertiary_bg }}
      />
    </Box>
  );
};

/**
 * Skeleton for accordion group
 */
const AccordionSkeleton = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton
            variant="text"
            width={120}
            height={24}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            width={60}
            height={22}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton
            variant="text"
            width={80}
            height={20}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Skeleton for filters
 */
const FiltersSkeleton = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 2,
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Search and actions row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton
          variant="rounded"
          width={200}
          height={36}
          sx={{ bgcolor: colors.tertiary_bg, flex: 1 }}
        />
        <Skeleton
          variant="rounded"
          width={100}
          height={36}
          sx={{ bgcolor: colors.tertiary_bg }}
        />
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{ bgcolor: colors.tertiary_bg }}
        />
      </Box>

      {/* Filter dropdowns row */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {[120, 100, 140, 100, 100, 100].map((width, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width={width}
            height={36}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        ))}
      </Box>
    </Box>
  );
};

/**
 * Skeleton for stats
 */
const StatsSkeleton = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Skeleton
            variant="text"
            width={150}
            height={28}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="text"
            width={200}
            height={16}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton
            variant="rounded"
            width={60}
            height={32}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
      </Box>

      {/* Progress bars */}
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Skeleton
              variant="text"
              width={80}
              height={18}
              sx={{ bgcolor: colors.tertiary_bg }}
            />
            <Skeleton
              variant="text"
              width={50}
              height={18}
              sx={{ bgcolor: colors.tertiary_bg }}
            />
          </Box>
          <Skeleton
            variant="rounded"
            height={6}
            sx={{ bgcolor: colors.tertiary_bg }}
          />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Main ActivitySkeleton component
 */
const ActivitySkeleton = ({
  variant = "list", // list, accordion, filters, stats
  count = 5,
  compact = false,
}) => {
  switch (variant) {
    case "card":
      return <ActivityCardSkeleton compact={compact} />;

    case "accordion":
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: count }).map((_, index) => (
            <AccordionSkeleton key={index} />
          ))}
        </Box>
      );

    case "filters":
      return <FiltersSkeleton />;

    case "stats":
      return <StatsSkeleton />;

    case "list":
    default:
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: count }).map((_, index) => (
            <ActivityCardSkeleton key={index} compact={compact} />
          ))}
        </Box>
      );
  }
};

export default React.memo(ActivitySkeleton);
