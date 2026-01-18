/**
 * FriendActivityPage Component
 * Full page view for friend activities with filtering and grouping.
 * Follows the same layout pattern as FriendshipReport and other report pages.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Badge,
  Snackbar,
  Alert,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  MarkEmailRead as MarkAllReadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
  ActivityDetailModal,
} from "./components";
import {
  groupActivitiesByDate,
  groupActivitiesByService,
  groupActivitiesByFriend,
} from "./utils";
import { PAGINATION } from "./constants";
import "./FriendActivityPage.css";

const GROUP_VIEWS = {
  DATE: "date",
  SERVICE: "service",
  FRIEND: "friend",
  LIST: "list",
};

const FriendActivityPage = () => {
  const { colors, mode } = useTheme();
  const navigate = useNavigate();

  // Data hook
  const {
    activities,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshAll,
  } = useFriendActivityData({});

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
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  // Pagination for grouped view (accordion groups) - must be after groupedActivities
  const {
    paginatedData: paginatedGroups,
    currentPage: groupPage,
    totalPages: groupTotalPages,
    pageSize: groupPageSize,
    setCurrentPage: setGroupPage,
    changePageSize: changeGroupPageSize,
  } = usePagination(groupedActivities, PAGINATION.DEFAULT_PAGE_SIZE);

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

  // Handle view details
  const handleViewDetails = useCallback((activity) => {
    setSelectedActivity(activity);
    setDetailModalOpen(true);
  }, []);

  // Handle close detail modal
  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedActivity(null);
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate("/friends");
  }, [navigate]);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1200px)");

  return (
    <div
      className={`friend-activity-page ${mode === "dark" ? "dark" : "light"}`}
      style={{
        backgroundColor: colors.secondary_bg,
        borderColor: colors.border_color,
      }}
    >
      {/* Header */}
      <div
        className="activity-page-header"
        style={{
          borderBottomColor: colors.border_color,
          backgroundColor: colors.secondary_bg,
        }}
      >
        <div className="header-left">
          <IconButton
            onClick={handleBack}
            className="back-button"
            sx={{
              color: colors.primary_text,
              "&:hover": {
                backgroundColor: `${colors.primary_accent}20`,
              },
            }}
          >
            <BackIcon />
          </IconButton>
          <div className="header-title-section">
            <Typography
              variant="h5"
              className="page-title"
              sx={{ fontWeight: 600, color: colors.primary_text }}
            >
              Friend Activities
            </Typography>
            <Typography
              variant="body2"
              className="page-subtitle"
              sx={{ color: colors.secondary_text }}
            >
              Track all activities from your friends
            </Typography>
          </div>
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              className="unread-badge"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: colors.tertiary_text, ml: 1 }}
              >
                unread
              </Typography>
            </Badge>
          )}
        </div>

        <div className="header-right">
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton
                onClick={handleMarkAllAsRead}
                sx={{
                  color: colors.primary_accent,
                  "&:hover": {
                    backgroundColor: `${colors.primary_accent}20`,
                  },
                }}
              >
                <MarkAllReadIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Refresh">
            <IconButton
              onClick={refreshAll}
              sx={{
                color: colors.primary_accent,
                "&:hover": {
                  backgroundColor: `${colors.primary_accent}20`,
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Main Content */}
      <div className="activity-page-content">
        {/* Stats Section - Always Visible */}
        {!loading && (
          <div className="stats-section">
            <ActivityStats activities={filteredActivities} />
          </div>
        )}

        {/* Filters Section - Single Row with View Selector */}
        <div className="filters-section">
          <ActivityFilters
            filters={filters}
            filterStats={filterStats}
            uniqueFriends={uniqueFriends}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            onRefresh={refreshAll}
            onMarkAllRead={handleMarkAllAsRead}
            unreadCount={unreadCount}
            loading={loading}
            groupView={groupView}
            onViewChange={setGroupView}
          />
        </div>

        {/* Loading State */}
        {loading && <ActivitySkeleton variant="list" count={5} />}

        {/* Empty State */}
        {!loading && filteredActivities.length === 0 && (
          <ActivityEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onRefresh={refreshAll}
          />
        )}

        {/* Activities Content */}
        {!loading && filteredActivities.length > 0 && (
          <div
            className="activities-container"
            style={{
              backgroundColor: colors.secondary_bg,
              borderColor: colors.border_color,
            }}
          >
            {groupView === GROUP_VIEWS.LIST ? (
              // List View
              <>
                {/* Scrollable List Container */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 1,
                    mb: 1,
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
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {paginatedData.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onMarkAsRead={handleMarkAsRead}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </Box>
                </Box>

                {/* List Pagination - Fixed at bottom, outside scroll area */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      py: 1,
                      borderTop: `1px solid ${colors.border_color}`,
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: colors.secondary_text,
                          "&.Mui-selected": {
                            backgroundColor: colors.primary_accent,
                            color: colors.button_text,
                          },
                          "&:hover": {
                            backgroundColor: colors.primary_accent,
                            opacity: 0.7,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              // Grouped Views (Date, Service, Friend)
              <>
                {/* Scrollable Accordion Container */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 1,
                    mb: 1,
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
                  <ActivityAccordion
                    groups={paginatedGroups}
                    onMarkAsRead={handleMarkAsRead}
                    onViewDetails={handleViewDetails}
                    groupType={groupView}
                  />
                </Box>

                {/* Group-level Pagination - Fixed at bottom, outside scroll area */}
                {groupTotalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      py: 1,
                      borderTop: `1px solid ${colors.border_color}`,
                    }}
                  >
                    <Pagination
                      count={groupTotalPages}
                      page={groupPage}
                      onChange={(e, page) => setGroupPage(page)}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: colors.secondary_text,
                          "&.Mui-selected": {
                            backgroundColor: colors.primary_accent,
                            color: colors.button_text,
                          },
                          "&:hover": {
                            backgroundColor: colors.primary_accent,
                            opacity: 0.7,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </div>
        )}
      </div>

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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        activity={selectedActivity}
      />
    </div>
  );
};

export default FriendActivityPage;
