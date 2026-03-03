/**
 * ActivitySkeleton Component
 * Loading skeleton for activity components.
 * Matches the actual design of each component for smooth loading transitions.
 */

import React from "react";
import { Box, Skeleton, keyframes } from "@mui/material";
import { useTheme } from "../../../../hooks/useTheme";

// Shimmer animation for enhanced loading effect
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

/**
 * Skeleton for individual activity card
 */
const ActivityCardSkeleton = ({ compact = false, showAvatar = true }) => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

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
      {showAvatar && (
        <Skeleton
          variant="circular"
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          sx={skeletonStyle}
          animation="wave"
        />
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header - Entity Type & Action Chips */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Skeleton
            variant="rounded"
            width={75}
            height={22}
            sx={{ ...skeletonStyle, borderRadius: "4px" }}
            animation="wave"
          />
          <Skeleton
            variant="rounded"
            width={60}
            height={22}
            sx={{ ...skeletonStyle, borderRadius: "4px" }}
            animation="wave"
          />
          <Box sx={{ flex: 1 }} />
          <Skeleton
            variant="text"
            width={70}
            height={18}
            sx={skeletonStyle}
            animation="wave"
          />
        </Box>

        {/* Description */}
        <Skeleton
          variant="text"
          width="95%"
          height={20}
          sx={{ ...skeletonStyle, mb: 0.5 }}
          animation="wave"
        />
        <Skeleton
          variant="text"
          width="70%"
          height={20}
          sx={skeletonStyle}
          animation="wave"
        />

        {/* Footer - Amount & Timestamp */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
          }}
        >
          <Skeleton
            variant="rounded"
            width={90}
            height={24}
            sx={{ ...skeletonStyle, borderRadius: "4px" }}
            animation="wave"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="text"
              width={80}
              height={16}
              sx={skeletonStyle}
              animation="wave"
            />
            <Skeleton
              variant="circular"
              width={28}
              height={28}
              sx={skeletonStyle}
              animation="wave"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Skeleton for accordion group - Date/Service view
 */
const AccordionSkeleton = ({ variant = "default" }) => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

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
          {/* Label */}
          <Skeleton
            variant="text"
            width={130}
            height={26}
            sx={skeletonStyle}
            animation="wave"
          />
          {/* Item Count Chip */}
          <Skeleton
            variant="rounded"
            width={65}
            height={22}
            sx={{ ...skeletonStyle, borderRadius: "12px" }}
            animation="wave"
          />
          {/* Unread Badge */}
          <Skeleton
            variant="rounded"
            width={55}
            height={20}
            sx={{ ...skeletonStyle, borderRadius: "10px" }}
            animation="wave"
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Amount */}
          <Skeleton
            variant="text"
            width={90}
            height={22}
            sx={skeletonStyle}
            animation="wave"
          />
          {/* Expand Icon */}
          <Skeleton
            variant="circular"
            width={28}
            height={28}
            sx={skeletonStyle}
            animation="wave"
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Skeleton for accordion group - Friend view with avatar and details
 * Matches the actual FriendActivityPage design with avatar, name, badges, and details
 */
const FriendAccordionSkeleton = () => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

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
          {/* Friend Avatar - 40x40 as per actual component */}
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={skeletonStyle}
            animation="wave"
          />

          {/* Friend Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            {/* Name and badges row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Friend Name */}
              <Skeleton
                variant="text"
                width={110}
                height={24}
                sx={skeletonStyle}
                animation="wave"
              />
              {/* Items count chip */}
              <Skeleton
                variant="rounded"
                width={55}
                height={22}
                sx={{ ...skeletonStyle, borderRadius: "11px" }}
                animation="wave"
              />
              {/* Unread badge */}
              <Skeleton
                variant="rounded"
                width={50}
                height={18}
                sx={{ ...skeletonStyle, borderRadius: "9px" }}
                animation="wave"
              />
            </Box>

            {/* Friend details row - email, phone, username */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Email */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Skeleton
                  variant="circular"
                  width={14}
                  height={14}
                  sx={skeletonStyle}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={130}
                  height={16}
                  sx={skeletonStyle}
                  animation="wave"
                />
              </Box>
              {/* Phone */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Skeleton
                  variant="circular"
                  width={14}
                  height={14}
                  sx={skeletonStyle}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={75}
                  height={16}
                  sx={skeletonStyle}
                  animation="wave"
                />
              </Box>
              {/* Username */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Skeleton
                  variant="circular"
                  width={14}
                  height={14}
                  sx={skeletonStyle}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={60}
                  height={16}
                  sx={skeletonStyle}
                  animation="wave"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Amount - larger text */}
          <Skeleton
            variant="text"
            width={100}
            height={26}
            sx={skeletonStyle}
            animation="wave"
          />
          {/* Expand Icon */}
          <Skeleton
            variant="rounded"
            width={24}
            height={24}
            sx={{ ...skeletonStyle, borderRadius: "4px" }}
            animation="wave"
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Skeleton for stats section - matches ActivityStats layout
 */
const StatsSkeleton = () => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

  // Service items skeleton
  const services = [1, 2, 3, 4, 5];

  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: colors.primary_bg,
        borderRadius: "10px",
        border: `1px solid ${colors.border_color}`,
        width: "100%",
      }}
    >
      {/* Header Row - Title and Total Amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Skeleton
          variant="text"
          width={130}
          height={26}
          sx={skeletonStyle}
          animation="wave"
        />
        <Skeleton
          variant="text"
          width={100}
          height={28}
          sx={skeletonStyle}
          animation="wave"
        />
      </Box>

      {/* Service Breakdown - Horizontal Layout */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {services.map((_, index) => (
          <Box
            key={index}
            sx={{
              flex: "1 1 auto",
              minWidth: 100,
              p: 0.75,
              borderRadius: "6px",
              backgroundColor: colors.secondary_bg,
            }}
          >
            {/* Icon and Label */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <Skeleton
                variant="circular"
                width={16}
                height={16}
                sx={skeletonStyle}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={50}
                height={16}
                sx={skeletonStyle}
                animation="wave"
              />
            </Box>
            {/* Progress Bar */}
            <Skeleton
              variant="rounded"
              height={4}
              sx={{ ...skeletonStyle, borderRadius: "2px", mb: 0.25 }}
              animation="wave"
            />
            {/* Count */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Skeleton
                variant="text"
                width={20}
                height={14}
                sx={skeletonStyle}
                animation="wave"
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/**
 * Skeleton for filters section
 */
const FiltersSkeleton = () => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        p: 1.5,
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Search */}
      <Skeleton
        variant="rounded"
        width={280}
        height={40}
        sx={{ ...skeletonStyle, flex: "1 1 200px", maxWidth: 400 }}
        animation="wave"
      />

      {/* Filter dropdowns */}
      <Skeleton
        variant="rounded"
        width={130}
        height={40}
        sx={skeletonStyle}
        animation="wave"
      />
      <Skeleton
        variant="rounded"
        width={110}
        height={40}
        sx={skeletonStyle}
        animation="wave"
      />
      <Skeleton
        variant="rounded"
        width={100}
        height={40}
        sx={skeletonStyle}
        animation="wave"
      />

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={skeletonStyle}
          animation="wave"
        />
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={skeletonStyle}
          animation="wave"
        />
        <Skeleton
          variant="rounded"
          width={36}
          height={36}
          sx={{ ...skeletonStyle, borderRadius: "8px" }}
          animation="wave"
        />
      </Box>
    </Box>
  );
};

/**
 * Skeleton for pagination
 */
const PaginationSkeleton = () => {
  const { colors } = useTheme();

  const skeletonStyle = {
    bgcolor: colors.tertiary_bg,
    "&::after": {
      background: `linear-gradient(90deg, transparent, ${colors.border_color}40, transparent)`,
      animation: `${shimmer} 1.5s infinite`,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 0.5,
        py: 1,
        borderTop: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Previous arrow */}
      <Skeleton
        variant="circular"
        width={32}
        height={32}
        sx={skeletonStyle}
        animation="wave"
      />
      {/* Page numbers */}
      {[1, 2, 3].map((_, index) => (
        <Skeleton
          key={index}
          variant="circular"
          width={32}
          height={32}
          sx={skeletonStyle}
          animation="wave"
        />
      ))}
      {/* Next arrow */}
      <Skeleton
        variant="circular"
        width={32}
        height={32}
        sx={skeletonStyle}
        animation="wave"
      />
    </Box>
  );
};

/**
 * Full page skeleton for initial load
 */
const PageSkeleton = ({ groupView = "LIST" }) => {
  const skeletonType =
    groupView === "FRIEND"
      ? "accordion-friend"
      : groupView === "LIST"
        ? "list"
        : "accordion";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Stats */}
      <StatsSkeleton />

      {/* Filters */}
      <FiltersSkeleton />

      {/* Content based on view */}
      <ActivitySkeleton variant={skeletonType} count={5} />

      {/* Pagination */}
      <PaginationSkeleton />
    </Box>
  );
};

/**
 * Main ActivitySkeleton component
 */
const ActivitySkeleton = ({
  variant = "list", // list, accordion, accordion-friend, filters, stats, page
  count = 5,
  compact = false,
  showAvatar = true,
  groupView = "LIST", // Used for page variant
}) => {
  switch (variant) {
    case "card":
      return <ActivityCardSkeleton compact={compact} showAvatar={showAvatar} />;

    case "accordion":
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: count }).map((_, index) => (
            <AccordionSkeleton key={index} />
          ))}
        </Box>
      );

    case "accordion-friend":
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: count }).map((_, index) => (
            <FriendAccordionSkeleton key={index} />
          ))}
        </Box>
      );

    case "filters":
      return <FiltersSkeleton />;

    case "stats":
      return <StatsSkeleton />;

    case "pagination":
      return <PaginationSkeleton />;

    case "page":
      return <PageSkeleton groupView={groupView} />;

    case "list":
    default:
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: count }).map((_, index) => (
            <ActivityCardSkeleton
              key={index}
              compact={compact}
              showAvatar={showAvatar}
            />
          ))}
        </Box>
      );
  }
};

// Export individual skeletons for granular use
export {
  ActivityCardSkeleton,
  AccordionSkeleton,
  FriendAccordionSkeleton,
  StatsSkeleton,
  FiltersSkeleton,
  PaginationSkeleton,
  PageSkeleton,
};

export default React.memo(ActivitySkeleton);
