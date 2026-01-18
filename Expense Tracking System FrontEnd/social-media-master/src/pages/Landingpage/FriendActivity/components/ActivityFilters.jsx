/**
 * ActivityFilters Component
 * Single-row filter bar with search and filters, matching Budget component style.
 * Includes view selector menu for grouping options.
 */

import React, { useCallback, useState } from "react";
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
  Menu,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  ViewList as ListView,
  DateRange as DateIcon,
  Category as ServiceIcon,
  People as FriendIcon,
  FilterList as FilterListIcon,
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

// View options for the menu
const VIEW_OPTIONS = [
  { value: "date", label: "By Date", icon: DateIcon },
  { value: "service", label: "By Service", icon: ServiceIcon },
  { value: "friend", label: "By Friend", icon: FriendIcon },
  { value: "list", label: "List View", icon: ListView },
];

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
  // View selector props
  groupView = "date",
  onViewChange,
}) => {
  const { colors } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // View menu state
  const [viewMenuAnchor, setViewMenuAnchor] = useState(null);
  const viewMenuOpen = Boolean(viewMenuAnchor);

  const handleViewMenuOpen = (event) => {
    setViewMenuAnchor(event.currentTarget);
  };

  const handleViewMenuClose = () => {
    setViewMenuAnchor(null);
  };

  const handleViewSelect = (view) => {
    if (onViewChange) {
      onViewChange(view);
    }
    handleViewMenuClose();
  };

  // Get current view label and icon
  const currentView =
    VIEW_OPTIONS.find((v) => v.value === groupView) || VIEW_OPTIONS[0];
  const CurrentViewIcon = currentView.icon;

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

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.tertiary_bg} 100%)`,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        p: 1.5,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Single Row: Search and Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Search Input - Takes Half Width */}
        <Box sx={{ flex: isSmallScreen ? 1 : 0.5 }}>
          <TextField
            placeholder="Search activities..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      color: colors.primary_accent,
                      fontSize: "1.2rem",
                    }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: colors.secondary_bg,
                color: colors.primary_text,
                borderRadius: "8px",
                height: "42px",
                "& fieldset": {
                  borderColor: colors.border_color,
                  borderWidth: "1.5px",
                },
                "&:hover fieldset": {
                  borderColor: colors.primary_accent,
                  borderWidth: "1.5px",
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary_accent,
                  borderWidth: "2px",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                "&::placeholder": {
                  color: colors.icon_muted,
                  opacity: 0.8,
                },
              },
            }}
          />
        </Box>

        {/* Filter and Sort Controls - Takes Half Width */}
        <Box
          sx={{
            flex: isSmallScreen ? 1 : 0.5,
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          {/* Filter Dropdowns Row */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {/* Service Filter */}
            <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
              <InputLabel
                sx={{ color: colors.secondary_text, fontSize: "0.8rem" }}
              >
                Service
              </InputLabel>
              <Select
                value={filters.serviceFilter}
                onChange={handleServiceChange}
                label="Service"
                sx={{
                  height: "42px",
                  bgcolor: colors.secondary_bg,
                  color: colors.primary_text,
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  "& fieldset": { borderColor: colors.border_color },
                  "&:hover fieldset": { borderColor: colors.primary_accent },
                }}
              >
                {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: "0.85rem" }}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Time Range Filter */}
            <FormControl size="small" sx={{ minWidth: 90, flex: 1 }}>
              <InputLabel
                sx={{ color: colors.secondary_text, fontSize: "0.8rem" }}
              >
                Time
              </InputLabel>
              <Select
                value={filters.timeRange}
                onChange={handleTimeRangeChange}
                label="Time"
                sx={{
                  height: "42px",
                  bgcolor: colors.secondary_bg,
                  color: colors.primary_text,
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  "& fieldset": { borderColor: colors.border_color },
                  "&:hover fieldset": { borderColor: colors.primary_accent },
                }}
              >
                {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
                  <MenuItem
                    key={key}
                    value={key}
                    disabled={key === TIME_RANGES.CUSTOM}
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort By */}
            <FormControl size="small" sx={{ minWidth: 90, flex: 1 }}>
              <InputLabel
                sx={{ color: colors.secondary_text, fontSize: "0.8rem" }}
              >
                Sort
              </InputLabel>
              <Select
                value={filters.sortBy}
                onChange={handleSortByChange}
                label="Sort"
                sx={{
                  height: "42px",
                  bgcolor: colors.secondary_bg,
                  color: colors.primary_text,
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  "& fieldset": { borderColor: colors.border_color },
                  "&:hover fieldset": { borderColor: colors.primary_accent },
                }}
              >
                {Object.entries(SORT_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: "0.85rem" }}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {/* Sort Order Toggle */}
            <Tooltip
              title={`Sort ${filters.sortOrder === SORT_ORDER.DESC ? "Ascending" : "Descending"}`}
            >
              <IconButton
                size="small"
                onClick={handleSortOrderToggle}
                sx={{
                  color: colors.primary_accent,
                  bgcolor: colors.secondary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "6px",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    bgcolor: colors.hover_bg,
                    borderColor: colors.primary_accent,
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

            {/* Refresh */}
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                sx={{
                  color: colors.primary_accent,
                  bgcolor: colors.secondary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "6px",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    bgcolor: colors.hover_bg,
                    borderColor: colors.primary_accent,
                  },
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 18,
                    animation: loading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <IconButton
                  size="small"
                  onClick={onResetFilters}
                  sx={{
                    color: "#ef4444",
                    bgcolor: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: "6px",
                    width: 36,
                    height: 36,
                    "&:hover": {
                      bgcolor: "#ef444420",
                      borderColor: "#ef4444",
                    },
                  }}
                >
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* View Selector */}
            <Tooltip title={`View: ${currentView.label}`}>
              <IconButton
                size="small"
                onClick={handleViewMenuOpen}
                sx={{
                  color: colors.button_text,
                  bgcolor: colors.primary_accent,
                  borderRadius: "6px",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    bgcolor: colors.tertiary_accent,
                  },
                }}
              >
                <CurrentViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* View Menu */}
            <Menu
              anchorEl={viewMenuAnchor}
              open={viewMenuOpen}
              onClose={handleViewMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  bgcolor: colors.secondary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "8px",
                  mt: 1,
                  minWidth: 160,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              {VIEW_OPTIONS.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = groupView === option.value;
                return (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleViewSelect(option.value)}
                    selected={isSelected}
                    sx={{
                      py: 1,
                      px: 2,
                      color: isSelected
                        ? colors.primary_accent
                        : colors.primary_text,
                      bgcolor: isSelected
                        ? `${colors.primary_accent}15`
                        : "transparent",
                      "&:hover": {
                        bgcolor: `${colors.primary_accent}20`,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <OptionIcon
                        sx={{
                          fontSize: 18,
                          color: isSelected
                            ? colors.primary_accent
                            : colors.secondary_text,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={option.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    />
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Active Filters Display - Below */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1.5 }}>
          {filters.searchTerm && (
            <Chip
              size="small"
              label={`"${filters.searchTerm}"`}
              onDelete={() => onFilterChange("searchTerm", "")}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {filters.serviceFilter !== SERVICES.ALL && (
            <Chip
              size="small"
              label={SERVICE_LABELS[filters.serviceFilter]}
              onDelete={() => onFilterChange("serviceFilter", SERVICES.ALL)}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {filters.actionFilter !== ACTIONS.ALL && (
            <Chip
              size="small"
              label={ACTION_LABELS[filters.actionFilter]}
              onDelete={() => onFilterChange("actionFilter", ACTIONS.ALL)}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {filters.friendFilter && (
            <Chip
              size="small"
              label={
                uniqueFriends.find((f) => f.id === filters.friendFilter)
                  ?.name || "Friend"
              }
              onDelete={() => onFilterChange("friendFilter", null)}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {filters.timeRange !== TIME_RANGES.ALL && (
            <Chip
              size="small"
              label={TIME_RANGE_LABELS[filters.timeRange]}
              onDelete={() => onFilterChange("timeRange", TIME_RANGES.ALL)}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {filters.readStatus !== READ_STATUS.ALL && (
            <Chip
              size="small"
              label={READ_STATUS_LABELS[filters.readStatus]}
              onDelete={() => onFilterChange("readStatus", READ_STATUS.ALL)}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ActivityFilters);
