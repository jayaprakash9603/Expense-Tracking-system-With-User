/**
 * ActivityAccordion Component
 * Displays activities grouped in expandable accordion sections.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Badge,
  Chip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import ActivityCard from "./ActivityCard";
import { usePagination } from "../hooks";
import { PAGINATION } from "../constants";
import { getEntityColor } from "../utils";

const ActivityAccordion = ({
  groups = [],
  onMarkAsRead,
  onViewDetails,
  defaultExpanded = null,
  showPagination = true,
  groupType = "date", // date, service, friend
}) => {
  const { colors } = useTheme();
  const [expandedGroup, setExpandedGroup] = useState(defaultExpanded);

  // Handle accordion toggle
  const toggleGroup = useCallback((groupKey) => {
    setExpandedGroup((prev) => (prev === groupKey ? null : groupKey));
  }, []);

  if (!groups.length) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          color: colors.secondary_text,
        }}
      >
        <Typography variant="body2">No activities found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Accordion Groups - Render all passed groups (pagination handled by parent) */}
      {groups.map((group) => (
        <AccordionItem
          key={group.key}
          group={group}
          isExpanded={expandedGroup === group.key}
          onToggle={() => toggleGroup(group.key)}
          onMarkAsRead={onMarkAsRead}
          onViewDetails={onViewDetails}
          showPagination={showPagination}
          groupType={groupType}
          colors={colors}
        />
      ))}
    </Box>
  );
};

/**
 * Individual Accordion Item
 */
const AccordionItem = React.memo(
  ({
    group,
    isExpanded,
    onToggle,
    onMarkAsRead,
    onViewDetails,
    showPagination,
    groupType,
    colors,
  }) => {
    const { label, items = [], key, service, actorUser, friendId } = group;

    // Pagination for items
    const {
      paginatedData,
      currentPage,
      totalPages,
      pageSize,
      setCurrentPage,
      changePageSize,
    } = usePagination(items, PAGINATION.DEFAULT_PAGE_SIZE);

    // Calculate stats
    const unreadCount = useMemo(
      () => items.filter((item) => !item.isRead).length,
      [items],
    );

    const totalAmount = useMemo(
      () =>
        items.reduce(
          (sum, item) => sum + (item.amount ? Math.abs(item.amount) : 0),
          0,
        ),
      [items],
    );

    // Get accent color based on group type
    const accentColor = useMemo(() => {
      if (groupType === "service" && service) {
        return getEntityColor(service);
      }
      return colors.primary_accent;
    }, [groupType, service, colors]);

    // Get friend avatar and details for friend group type
    const friendInfo = useMemo(() => {
      if (groupType !== "friend" || !actorUser) return null;

      return {
        image: actorUser.image || actorUser.profileImage || null,
        email: actorUser.email || null,
        phone: actorUser.phoneNumber || actorUser.mobile || null,
        location: actorUser.location || null,
        fullName:
          actorUser.fullName ||
          `${actorUser.firstName || ""} ${actorUser.lastName || ""}`.trim() ||
          label,
        username: actorUser.username || null,
      };
    }, [groupType, actorUser, label]);

    // Generate avatar initials from name
    const avatarInitials = useMemo(() => {
      if (!label) return "?";
      const words = label.split(" ").filter(Boolean);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return label.substring(0, 2).toUpperCase();
    }, [label]);

    // Generate consistent avatar color based on friendId or label
    const avatarBgColor = useMemo(() => {
      const seed = friendId || label || "default";
      const colors = [
        "#F44336",
        "#E91E63",
        "#9C27B0",
        "#673AB7",
        "#3F51B5",
        "#2196F3",
        "#03A9F4",
        "#00BCD4",
        "#009688",
        "#4CAF50",
        "#8BC34A",
        "#FF9800",
        "#FF5722",
        "#795548",
        "#607D8B",
      ];
      let hash = 0;
      for (let i = 0; i < seed.toString().length; i++) {
        hash = seed.toString().charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    }, [friendId, label]);

    return (
      <Box
        sx={{
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          overflow: "hidden",
          transition: "all 0.2s ease",
          ...(isExpanded && {
            borderColor: accentColor,
            boxShadow: `0 0 0 1px ${accentColor}20`,
          }),
        }}
      >
        {/* Header */}
        <Box
          onClick={onToggle}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            cursor: "pointer",
            backgroundColor: isExpanded ? `${accentColor}10` : "transparent",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: `${accentColor}10`,
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Friend Avatar - Only for friend group type */}
            {groupType === "friend" && (
              <Avatar
                src={friendInfo?.image}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: friendInfo?.image
                    ? "transparent"
                    : avatarBgColor,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: `2px solid ${accentColor}30`,
                }}
              >
                {!friendInfo?.image && avatarInitials}
              </Avatar>
            )}

            {/* Friend Info Container */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {/* Group Label / Friend Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: colors.primary_text,
                  }}
                >
                  {label}
                </Typography>

                {/* Item Count */}
                <Chip
                  size="small"
                  label={`${items.length} ${items.length === 1 ? "item" : "items"}`}
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                  }}
                />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.65rem",
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: colors.secondary_text }}
                    >
                      unread
                    </Typography>
                  </Badge>
                )}
              </Box>

              {/* Friend Details - Only for friend group type when expanded or always show email */}
              {groupType === "friend" && friendInfo && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Email */}
                  {friendInfo.email && (
                    <Tooltip title="Email" arrow placement="top">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EmailIcon
                          sx={{ fontSize: 14, color: colors.tertiary_text }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondary_text,
                            fontSize: "0.75rem",
                          }}
                        >
                          {friendInfo.email}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}

                  {/* Phone - Show if available */}
                  {friendInfo.phone && (
                    <Tooltip title="Phone" arrow placement="top">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 14, color: colors.tertiary_text }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondary_text,
                            fontSize: "0.75rem",
                          }}
                        >
                          {friendInfo.phone}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}

                  {/* Location - Show if available */}
                  {friendInfo.location && (
                    <Tooltip title="Location" arrow placement="top">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocationIcon
                          sx={{ fontSize: 14, color: colors.tertiary_text }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondary_text,
                            fontSize: "0.75rem",
                          }}
                        >
                          {friendInfo.location}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}

                  {/* Username - Show if different from name */}
                  {friendInfo.username && friendInfo.username !== label && (
                    <Tooltip title="Username" arrow placement="top">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 14, color: colors.tertiary_text }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondary_text,
                            fontSize: "0.75rem",
                          }}
                        >
                          @{friendInfo.username}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Total Amount (if applicable) */}
            {totalAmount > 0 && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.secondary_text,
                }}
              >
                $
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            )}

            {/* Expand Icon */}
            <IconButton
              size="small"
              sx={{
                color: colors.tertiary_text,
                transition: "transform 0.2s ease",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Collapse in={isExpanded}>
          <Box
            sx={{
              borderTop: `1px solid ${colors.border_color}`,
            }}
          >
            {/* Activity Cards Container - No fixed height, parent handles scroll */}
            <Box
              sx={{
                p: 2,
                pt: 1,
              }}
            >
              {/* Activity Cards */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {paginatedData.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onMarkAsRead={onMarkAsRead}
                    onViewDetails={onViewDetails}
                    compact={false}
                    showAvatar={groupType !== "friend"}
                  />
                ))}
              </Box>
            </Box>

            {/* Pagination - Fixed at bottom, outside scroll area */}
            {showPagination &&
              items.length > PAGINATION.PAGE_SIZE_OPTIONS[0] && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderTop: `1px solid ${colors.border_color}`,
                    backgroundColor: colors.secondary_bg,
                  }}
                >
                  {/* Per Page Selector */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.tertiary_text, fontSize: "0.7rem" }}
                    >
                      Show:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 70 }}>
                      <Select
                        value={pageSize}
                        onChange={(e) => changePageSize(e.target.value)}
                        sx={{
                          height: 28,
                          fontSize: "0.75rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border_color,
                          },
                          color: colors.primary_text,
                          "& .MuiSelect-select": {
                            py: 0.5,
                          },
                        }}
                      >
                        {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                          <MenuItem key={size} value={size}>
                            {size}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Pagination Controls - Only if more than 1 page */}
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      size="small"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: colors.secondary_text,
                          minWidth: 28,
                          height: 28,
                          "&.Mui-selected": {
                            backgroundColor: accentColor,
                            color: colors.button_text,
                          },
                        },
                      }}
                    />
                  )}

                  {/* Items Count */}
                  <Typography
                    variant="caption"
                    sx={{ color: colors.tertiary_text, fontSize: "0.7rem" }}
                  >
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, items.length)} of{" "}
                    {items.length} items
                  </Typography>
                </Box>
              )}
          </Box>
        </Collapse>
      </Box>
    );
  },
);

export default React.memo(ActivityAccordion);
