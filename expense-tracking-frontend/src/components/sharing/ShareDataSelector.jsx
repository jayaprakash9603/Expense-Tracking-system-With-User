/**
 * =============================================================================
 * ShareDataSelector - Step 1: Select Data Type and Items
 * =============================================================================
 *
 * First step in the share creation flow allowing users to:
 * - Switch between data types (Expenses, Categories, Budgets)
 * - Search and filter items
 * - Select multiple items to share
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React, { useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Icon Mapping
// =============================================================================

const ICONS = {
  EXPENSE: <ReceiptIcon />,
  CATEGORY: <CategoryIcon />,
  BUDGET: <BudgetIcon />,
};

// =============================================================================
// Component
// =============================================================================

const ShareDataSelector = ({
  activeTab,
  resourceType,
  selectedItems,
  searchTerm,
  filteredItems,
  dataTypeOptions,
  onTabChange,
  onSearchChange,
  onToggleItem,
  onSelectAll,
  error,
  isSmallScreen = false,
  hasPreSelectedItems = false,
  preSelectedType,
  // Pagination props
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  totalItems = 0,
}) => {
  const { colors, isDark } = useTheme();
  const scrollContainerRef = useRef(null);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e) => {
      if (isLoadingMore || !hasMore || hasPreSelectedItems) return;

      const { scrollTop, scrollHeight, clientHeight } = e.target;
      // Load more when user scrolls to 80% of the container
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        onLoadMore?.();
      }
    },
    [isLoadingMore, hasMore, hasPreSelectedItems, onLoadMore],
  );

  // Get the label for the pre-selected type
  const preSelectedTypeLabel =
    hasPreSelectedItems && preSelectedType
      ? dataTypeOptions.find((opt) => opt.value === preSelectedType)?.label ||
        preSelectedType
      : "";

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tabs for Data Type Selection - Hide if pre-selected */}
      {!hasPreSelectedItems ? (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${isDark ? "#333333" : colors.border}`,
            flexShrink: 0,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            variant={isSmallScreen ? "fullWidth" : "standard"}
            sx={{
              minHeight: 48,
              "& .MuiTabs-indicator": {
                backgroundColor: colors.primary,
              },
            }}
          >
            {dataTypeOptions.map((option, index) => (
              <Tab
                key={option.value}
                icon={ICONS[option.value]}
                label={option.label}
                iconPosition="start"
                sx={{
                  color:
                    activeTab === index
                      ? colors.primary
                      : colors.secondary_text,
                  fontWeight: activeTab === index ? 600 : 400,
                  minHeight: 48,
                  textTransform: "none",
                  "&.Mui-selected": {
                    color: colors.primary,
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>
      ) : (
        // Show a simple header when in pre-selected mode
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${isDark ? "#333333" : colors.border}`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {ICONS[preSelectedType]}
          <Typography
            variant="subtitle1"
            sx={{ color: colors.primary, fontWeight: 600 }}
          >
            Selected {preSelectedTypeLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            ({filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}{" "}
            from CashFlow)
          </Typography>
        </Paper>
      )}

      {/* Search and Select All */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder={`Search ${resourceType.toLowerCase()}s...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: colors.secondary_text, fontSize: 20 }}
                />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange("")}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              color: colors.primary_text,
              backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            },
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={
                selectedItems.length === filteredItems.length &&
                filteredItems.length > 0
              }
              indeterminate={
                selectedItems.length > 0 &&
                selectedItems.length < filteredItems.length
              }
              onChange={onSelectAll}
              size="small"
              sx={{ color: colors.primary }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Select All ({filteredItems.length})
            </Typography>
          }
        />
      </Box>

      {/* Items Grid */}
      <Paper
        ref={scrollContainerRef}
        variant="outlined"
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: "auto",
          backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
          borderColor: isDark ? "#333333" : colors.border,
          borderRadius: 2,
          minHeight: 300,
          maxHeight: "calc(100vh - 450px)",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "#333333" : colors.border,
            borderRadius: "3px",
          },
        }}
      >
        {filteredItems.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: colors.secondary_text }}>
              {searchTerm
                ? `No ${resourceType.toLowerCase()}s match your search`
                : `No ${resourceType.toLowerCase()}s available to share`}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={0} sx={{ p: 1 }}>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(
                (i) => i.externalRef === item.externalRef,
              );
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.externalRef}>
                  <Card
                    onClick={() => onToggleItem(item)}
                    sx={{
                      m: 0.5,
                      cursor: "pointer",
                      border: `2px solid ${isSelected ? colors.primary : "transparent"}`,
                      backgroundColor: isSelected
                        ? `${colors.primary}15`
                        : isDark
                          ? "#1b1b1b"
                          : colors.card_bg,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isSelected
                          ? `${colors.primary}20`
                          : `${colors.primary}08`,
                        borderColor: colors.primary,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          size="small"
                          sx={{ p: 0, mr: 0.5 }}
                        />
                        <Box
                          sx={{
                            color: colors.primary,
                            display: "flex",
                            alignItems: "center",
                            "& svg": { fontSize: 18 },
                          }}
                        >
                          {ICONS[resourceType]}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.primary_text,
                              fontWeight: 500,
                              fontSize: "0.85rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.displayName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.secondary_text,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 2,
              gap: 1,
            }}
          >
            <CircularProgress size={20} sx={{ color: colors.primary }} />
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Loading more...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Selection Count */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckIcon
            sx={{
              color:
                selectedItems.length > 0
                  ? colors.primary
                  : colors.secondary_text,
              fontSize: 20,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color:
                selectedItems.length > 0
                  ? colors.primary_text
                  : colors.secondary_text,
            }}
          >
            {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}{" "}
            selected
          </Typography>
        </Box>
        {totalItems > 0 && !hasPreSelectedItems && (
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            Showing {filteredItems.length} of {totalItems} total
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, flexShrink: 0 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ShareDataSelector;
