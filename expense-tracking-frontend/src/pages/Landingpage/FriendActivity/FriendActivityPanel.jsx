/**
 * FriendActivityPanel Component
 * Main component for displaying friend activities with filtering and grouping.
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ViewList as ListView,
  ViewModule as GridIcon,
  DateRange as DateIcon,
  Category as ServiceIcon,
  People as FriendIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useFriendActivityData, useFriendActivityFilters } from "./hooks";
import { usePagination } from "./hooks/usePagination";
import {
  ActivityFilters,
  ActivityAccordion,
  ActivityCard,
  ActivityStats,
  ActivityEmptyState,
  ActivitySkeleton,
} from "./components";
import {
  groupActivitiesByDate,
  groupActivitiesByService,
  groupActivitiesByFriend,
} from "./utils";
import { PAGINATION } from "./constants";

const GROUP_VIEWS = {
  DATE: "date",
  SERVICE: "service",
  FRIEND: "friend",
  LIST: "list",
};

const FriendActivityPanel = ({
  isOpen,
  onClose,
  friendId = null, // Optional: filter by specific friend
  showHeader = true,
  embedded = false,
}) => {
  const { colors } = useTheme();

  // Data hook
  const {
    activities,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshAll,
  } = useFriendActivityData({ friendId });

  // Filter hook
  const {
    filters,
    filteredActivities,
    filterStats,
    uniqueFriends,
    hasActiveFilters,
    updateFilter,
    resetFilters,
  } = useFriendActivityFilters(activities);

  // View state
  const [groupView, setGroupView] = useState(GROUP_VIEWS.DATE);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination for list view
  const {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    changePageSize,
  } = usePagination(filteredActivities, PAGINATION.DEFAULT_PAGE_SIZE);

  // Group activities based on view
  const groupedActivities = useMemo(() => {
    switch (groupView) {
      case GROUP_VIEWS.DATE:
        return groupActivitiesByDate(filteredActivities);
      case GROUP_VIEWS.SERVICE:
        return groupActivitiesByService(filteredActivities);
      case GROUP_VIEWS.FRIEND:
        return groupActivitiesByFriend(filteredActivities);
      default:
        return [];
    }
  }, [filteredActivities, groupView]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    async (activityId) => {
      const result = await markAsRead(activityId);
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Activity marked as read",
          severity: "success",
        });
      }
    },
    [markAsRead],
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const result = await markAllAsRead();
    if (result.success) {
      setSnackbar({
        open: true,
        message: `${result.count || "All"} activities marked as read`,
        severity: "success",
      });
    }
  }, [markAllAsRead]);

  // Handle view details (placeholder for future)
  const handleViewDetails = useCallback((activity) => {
    console.log("View activity details:", activity);
    // Could open a modal or navigate to detail view
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Container styles
  const containerStyles = embedded
    ? {
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        top: 0,
        right: 0,
        width: 480,
        maxWidth: "100vw",
        height: "100vh",
        backgroundColor: colors.primary_bg,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      };

  if (!isOpen && !embedded) return null;

  return (
    <Box sx={containerStyles}>
      {/* Header */}
      {showHeader && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${colors.border_color}`,
            backgroundColor: colors.secondary_bg,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: colors.primary_text }}
            >
              Friend Activities
            </Typography>
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.7rem",
                  },
                }}
              />
            )}
          </Box>
          {!embedded && (
            <IconButton
              onClick={onClose}
              sx={{
                color: colors.secondary_text,
                "&:hover": {
                  backgroundColor: `${colors.primary_accent}20`,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      {/* Stats Summary (compact) */}
      {!loading && filteredActivities.length > 0 && (
        <Box sx={{ p: 2, pb: 0 }}>
          <ActivityStats activities={filteredActivities} compact />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ p: 2, pb: 1 }}>
        {loading && !activities.length ? (
          <ActivitySkeleton variant="filters" />
        ) : (
          <ActivityFilters
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
            onRefresh={refreshAll}
            onMarkAllRead={handleMarkAllAsRead}
            uniqueFriends={uniqueFriends}
            hasActiveFilters={hasActiveFilters}
            unreadCount={filterStats.unread}
            loading={loading}
          />
        )}
      </Box>

      {/* View Tabs */}
      <Box sx={{ px: 2 }}>
        <Tabs
          value={groupView}
          onChange={(e, value) => setGroupView(value)}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              py: 0.5,
              fontSize: "0.8rem",
              textTransform: "none",
              color: colors.secondary_text,
              "&.Mui-selected": {
                color: colors.primary_accent,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: colors.primary_accent,
            },
          }}
        >
          <Tab
            value={GROUP_VIEWS.DATE}
            icon={<DateIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="By Date"
          />
          <Tab
            value={GROUP_VIEWS.SERVICE}
            icon={<ServiceIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="By Service"
          />
          <Tab
            value={GROUP_VIEWS.FRIEND}
            icon={<FriendIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="By Friend"
          />
          <Tab
            value={GROUP_VIEWS.LIST}
            icon={<ListView sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="List"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: colors.primary_bg,
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.primary_accent,
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: colors.secondary_accent,
            },
          },
        }}
      >
        {/* Loading State */}
        {loading && !activities.length && (
          <ActivitySkeleton
            variant={groupView === GROUP_VIEWS.LIST ? "list" : "accordion"}
            count={5}
          />
        )}

        {/* Error State */}
        {error && !loading && (
          <ActivityEmptyState
            message="Failed to load activities"
            subMessage={error}
            onRefresh={refreshAll}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredActivities.length === 0 && (
          <ActivityEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onRefresh={refreshAll}
          />
        )}

        {/* Activities */}
        {!loading && filteredActivities.length > 0 && (
          <>
            {groupView === GROUP_VIEWS.LIST ? (
              // List View
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {paginatedData.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onMarkAsRead={handleMarkAsRead}
                    onViewDetails={handleViewDetails}
                  />
                ))}

                {/* List Pagination */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${colors.border_color}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: colors.tertiary_text }}
                    >
                      Page {currentPage} of {totalPages}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        sx={{ color: colors.secondary_text }}
                      >
                        ‹
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        sx={{ color: colors.secondary_text }}
                      >
                        ›
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              // Accordion View
              <ActivityAccordion
                groups={groupedActivities}
                onMarkAsRead={handleMarkAsRead}
                onViewDetails={handleViewDetails}
                groupType={groupView}
                showPagination
              />
            )}
          </>
        )}
      </Box>

      {/* Filter Stats Footer */}
      {hasActiveFilters && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${colors.border_color}`,
            backgroundColor: colors.secondary_bg,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: colors.tertiary_text }}>
            Showing {filterStats.filtered} of {filterStats.total} activities
            {filterStats.hidden > 0 &&
              ` (${filterStats.hidden} hidden by filters)`}
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            backgroundColor:
              snackbar.severity === "success" ? "#14b8a6" : "#ef4444",
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(FriendActivityPanel);
