import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import PropTypes from "prop-types";

/**
 * ReportsHistoryHeader - Header component for Reports History
 * 
 * Features:
 * - Search functionality
 * - Filter and sort buttons
 * - Refresh button
 * - Total count display
 * - Theme-aware styling
 * - Responsive design
 * 
 * @param {number} totalCount - Total number of reports
 * @param {string} searchQuery - Current search query
 * @param {function} onSearchChange - Search change handler
 * @param {function} onFilter - Filter click handler
 * @param {function} onSort - Sort click handler
 * @param {function} onRefresh - Refresh handler
 */
const ReportsHistoryHeader = ({
  totalCount = 0,
  searchQuery = "",
  onSearchChange,
  onFilter,
  onSort,
  onRefresh,
}) => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        bgcolor: colors.secondary_bg,
        borderRadius: 3,
        p: 2,
        border: "1px solid var(--color-border-color)",
      }}
    >
      {/* Single Line: Search, Filters, Count, and Refresh */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
      >
        {/* Search Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by report name, type, or date..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "var(--color-primary-accent)", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--color-primary-bg)",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "var(--color-border-color)",
              },
              "&:hover fieldset": {
                borderColor: colors.primary_accent,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.primary_accent,
                borderWidth: 2,
              },
            },
            "& .MuiInputBase-input": {
              color: "var(--color-primary-text)",
              "&::placeholder": {
                color: "var(--color-secondary-text)",
                opacity: 0.7,
              },
            },
          }}
        />

        {/* Filter Button */}
        <Tooltip title="Filter Reports" arrow>
          <IconButton
            onClick={onFilter}
            sx={{
              color: "var(--color-primary-text)",
              backgroundColor: "var(--color-primary-bg)",
              border: "1px solid var(--color-border-color)",
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: colors.hover_bg,
                borderColor: colors.primary_accent,
              },
            }}
          >
            <FilterIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Sort Button */}
        <Tooltip title="Sort Reports" arrow>
          <IconButton
            onClick={onSort}
            sx={{
              color: "var(--color-primary-text)",
              backgroundColor: "var(--color-primary-bg)",
              border: "1px solid var(--color-border-color)",
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: colors.hover_bg,
                borderColor: colors.primary_accent,
              },
            }}
          >
            <SortIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Count Chip */}
        <Chip
          label={`${totalCount} ${totalCount === 1 ? "Report" : "Reports"}`}
          sx={{
            bgcolor: `${colors.primary_accent}15`,
            color: "var(--color-primary-accent)",
            fontWeight: 600,
            fontSize: 14,
            height: 32,
            px: 1,
          }}
        />

        {/* Refresh Button */}
        <Tooltip title="Refresh" arrow>
          <IconButton
            onClick={onRefresh}
            sx={{
              color: "var(--color-primary-accent)",
              bgcolor: `${colors.primary_accent}10`,
              "&:hover": {
                bgcolor: `${colors.primary_accent}20`,
                transform: "rotate(180deg)",
              },
              transition: "all 0.4s ease",
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

ReportsHistoryHeader.propTypes = {
  totalCount: PropTypes.number,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onFilter: PropTypes.func,
  onSort: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default ReportsHistoryHeader;
