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
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
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
    const { label, items = [], key, service, actorUser } = group;

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
            {/* Group Label */}
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
