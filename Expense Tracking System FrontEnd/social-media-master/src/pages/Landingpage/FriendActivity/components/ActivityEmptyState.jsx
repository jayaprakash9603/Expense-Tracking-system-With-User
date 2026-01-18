/**
 * ActivityEmptyState Component
 * Displays when no activities are available.
 */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  Inbox as EmptyIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";

const ActivityEmptyState = ({
  hasFilters = false,
  onResetFilters,
  onRefresh,
  message,
  subMessage,
}) => {
  const { colors } = useTheme();

  const defaultMessage = hasFilters
    ? "No matching activities found"
    : "No friend activities yet";

  const defaultSubMessage = hasFilters
    ? "We couldn't find any activities matching your search criteria. Try adjusting your filters, changing the search term, or reset to see all activities."
    : "When your friends make changes to their expenses, bills, budgets, and more, you'll see their activity updates here.";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 4,
        textAlign: "center",
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px dashed ${colors.border_color}`,
        minHeight: 300,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: `${colors.primary_accent}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        {hasFilters ? (
          <FilterIcon sx={{ fontSize: 40, color: colors.primary_accent }} />
        ) : (
          <EmptyIcon sx={{ fontSize: 40, color: colors.primary_accent }} />
        )}
      </Box>

      {/* Message */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: colors.primary_text,
          mb: 1,
        }}
      >
        {message || defaultMessage}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: colors.secondary_text,
          mb: 3,
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {subMessage || defaultSubMessage}
      </Typography>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {hasFilters && onResetFilters && (
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={onResetFilters}
            sx={{
              textTransform: "none",
              borderColor: colors.primary_accent,
              color: colors.primary_accent,
              "&:hover": {
                borderColor: colors.primary_accent,
                backgroundColor: `${colors.primary_accent}10`,
              },
            }}
          >
            Clear Filters
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{
              textTransform: "none",
              backgroundColor: colors.primary_accent,
              "&:hover": {
                backgroundColor: colors.primary_accent,
                opacity: 0.9,
              },
            }}
          >
            Refresh
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ActivityEmptyState);
