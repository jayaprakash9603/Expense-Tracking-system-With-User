/**
 * ActivityFilters Component
 * Filter bar with search, service filter, action filter, and more.
 */

import React, { useCallback } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  MarkEmailRead as MarkAllReadIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import {
  SERVICES,
  SERVICE_LABELS,
  ACTIONS,
  ACTION_LABELS,
  READ_STATUS,
  READ_STATUS_LABELS,
  SORT_OPTIONS,
  SORT_LABELS,
  SORT_ORDER,
  TIME_RANGES,
  TIME_RANGE_LABELS,
} from "../constants";

const ActivityFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  onMarkAllRead,
  uniqueFriends = [],
  hasActiveFilters = false,
  unreadCount = 0,
  loading = false,
}) => {
  const { colors } = useTheme();

  // Handle individual filter changes
  const handleSearchChange = useCallback(
    (e) => onFilterChange("searchTerm", e.target.value),
    [onFilterChange],
  );

  const handleServiceChange = useCallback(
    (e) => onFilterChange("serviceFilter", e.target.value),
    [onFilterChange],
  );

  const handleActionChange = useCallback(
    (e) => onFilterChange("actionFilter", e.target.value),
    [onFilterChange],
  );

  const handleFriendChange = useCallback(
    (e) => onFilterChange("friendFilter", e.target.value || null),
    [onFilterChange],
  );

  const handleTimeRangeChange = useCallback(
    (e) => onFilterChange("timeRange", e.target.value),
    [onFilterChange],
  );

  const handleReadStatusChange = useCallback(
    (e) => onFilterChange("readStatus", e.target.value),
    [onFilterChange],
  );

  const handleSortByChange = useCallback(
    (e) => onFilterChange("sortBy", e.target.value),
    [onFilterChange],
  );

  const handleSortOrderToggle = useCallback(() => {
    onFilterChange(
      "sortOrder",
      filters.sortOrder === SORT_ORDER.DESC ? SORT_ORDER.ASC : SORT_ORDER.DESC,
    );
  }, [filters.sortOrder, onFilterChange]);

  const handleClearSearch = useCallback(() => {
    onFilterChange("searchTerm", "");
  }, [onFilterChange]);

  // Common select styles
  const selectStyles = {
    minWidth: 120,
    "& .MuiOutlinedInput-root": {
      height: 36,
      backgroundColor: colors.secondary_bg,
      "& fieldset": {
        borderColor: colors.border_color,
      },
      "&:hover fieldset": {
        borderColor: colors.primary_accent,
      },
    },
    "& .MuiSelect-select": {
      py: 0.75,
      fontSize: "0.875rem",
    },
    "& .MuiInputLabel-root": {
      color: colors.secondary_text,
      fontSize: "0.875rem",
      top: -8,
    },
  };

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
      {/* Top Row: Search and Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Search Field */}
        <TextField
          size="small"
          placeholder="Search activities..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          sx={{
            flex: "1 1 200px",
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              height: 36,
              backgroundColor: colors.primary_bg,
              "& fieldset": {
                borderColor: colors.border_color,
              },
              "&:hover fieldset": {
                borderColor: colors.primary_accent,
              },
            },
            "& input": {
              fontSize: "0.875rem",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ fontSize: 20, color: colors.tertiary_text }}
                />
              </InputAdornment>
            ),
            endAdornment: filters.searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
          {unreadCount > 0 && (
            <Tooltip title={`Mark all ${unreadCount} as read`}>
              <Button
                size="small"
                startIcon={<MarkAllReadIcon />}
                onClick={onMarkAllRead}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: colors.primary_accent,
                  borderColor: colors.primary_accent,
                }}
                variant="outlined"
              >
                Mark All Read
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={loading}
              sx={{
                color: colors.secondary_text,
                "&:hover": {
                  color: colors.primary_accent,
                  backgroundColor: `${colors.primary_accent}20`,
                },
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 20,
                  animation: loading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>

          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={onResetFilters}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "#ef4444",
                }}
              >
                Clear Filters
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filter Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Service Filter */}
        <FormControl size="small" sx={selectStyles}>
          <InputLabel>Service</InputLabel>
          <Select
            value={filters.serviceFilter}
            onChange={handleServiceChange}
            label="Service"
          >
            {Object.entries(SERVICE_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Action Filter */}
        <FormControl size="small" sx={selectStyles}>
          <InputLabel>Action</InputLabel>
          <Select
            value={filters.actionFilter}
            onChange={handleActionChange}
            label="Action"
          >
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Friend Filter */}
        {uniqueFriends.length > 0 && (
          <FormControl size="small" sx={{ ...selectStyles, minWidth: 140 }}>
            <InputLabel>Friend</InputLabel>
            <Select
              value={filters.friendFilter || ""}
              onChange={handleFriendChange}
              label="Friend"
            >
              <MenuItem value="">All Friends</MenuItem>
              {uniqueFriends.map((friend) => (
                <MenuItem key={friend.id} value={friend.id}>
                  {friend.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Time Range Filter */}
        <FormControl size="small" sx={selectStyles}>
          <InputLabel>Time</InputLabel>
          <Select
            value={filters.timeRange}
            onChange={handleTimeRangeChange}
            label="Time"
          >
            {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
              <MenuItem
                key={key}
                value={key}
                disabled={key === TIME_RANGES.CUSTOM}
              >
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Read Status Filter */}
        <FormControl size="small" sx={selectStyles}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.readStatus}
            onChange={handleReadStatusChange}
            label="Status"
          >
            {Object.entries(READ_STATUS_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Divider */}
        <Box
          sx={{
            width: "1px",
            height: 24,
            backgroundColor: colors.border_color,
            mx: 0.5,
          }}
        />

        {/* Sort By */}
        <FormControl size="small" sx={selectStyles}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            onChange={handleSortByChange}
            label="Sort By"
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Order Toggle */}
        <Tooltip
          title={`Sort ${
            filters.sortOrder === SORT_ORDER.DESC ? "Ascending" : "Descending"
          }`}
        >
          <IconButton
            size="small"
            onClick={handleSortOrderToggle}
            sx={{
              color: colors.secondary_text,
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              "&:hover": {
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
              },
            }}
          >
            {filters.sortOrder === SORT_ORDER.DESC ? (
              <DescIcon sx={{ fontSize: 18 }} />
            ) : (
              <AscIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {filters.searchTerm && (
            <Chip
              size="small"
              label={`Search: "${filters.searchTerm}"`}
              onDelete={() => onFilterChange("searchTerm", "")}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
          {filters.serviceFilter !== SERVICES.ALL && (
            <Chip
              size="small"
              label={`Service: ${SERVICE_LABELS[filters.serviceFilter]}`}
              onDelete={() => onFilterChange("serviceFilter", SERVICES.ALL)}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
          {filters.actionFilter !== ACTIONS.ALL && (
            <Chip
              size="small"
              label={`Action: ${ACTION_LABELS[filters.actionFilter]}`}
              onDelete={() => onFilterChange("actionFilter", ACTIONS.ALL)}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
          {filters.friendFilter && (
            <Chip
              size="small"
              label={`Friend: ${
                uniqueFriends.find((f) => f.id === filters.friendFilter)
                  ?.name || filters.friendFilter
              }`}
              onDelete={() => onFilterChange("friendFilter", null)}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
          {filters.timeRange !== TIME_RANGES.ALL && (
            <Chip
              size="small"
              label={`Time: ${TIME_RANGE_LABELS[filters.timeRange]}`}
              onDelete={() => onFilterChange("timeRange", TIME_RANGES.ALL)}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
          {filters.readStatus !== READ_STATUS.ALL && (
            <Chip
              size="small"
              label={`Status: ${READ_STATUS_LABELS[filters.readStatus]}`}
              onDelete={() => onFilterChange("readStatus", READ_STATUS.ALL)}
              sx={{
                backgroundColor: colors.primary_bg,
                fontSize: "0.75rem",
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ActivityFilters);
