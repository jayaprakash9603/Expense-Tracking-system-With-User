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
 * UI/UX Improvements:
 * - Segmented control style tabs
 * - Sleek search bar
 * - Selectable tile design for cards without bulky checkboxes
 *
 * @author Expense Tracking System
 * @version 2.0
 * =============================================================================
 */

import React, { useRef, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  CreditCard as PaymentMethodIcon,
  Description as BillIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Icon Mapping
// =============================================================================

const ICONS = {
  EXPENSE: <ReceiptIcon />,
  CATEGORY: <CategoryIcon />,
  PAYMENT_METHOD: <PaymentMethodIcon />,
  BILL: <BillIcon />,
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
  // Filter props (optional)
  filterOptions,
  activeFilters,
  onFilterChange,
}) => {
  const { colors, isDark } = useTheme();
  const scrollContainerRef = useRef(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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

  const allSelected =
    selectedItems.length === filteredItems.length && filteredItems.length > 0;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Segmented Control Tabs */}
      {!hasPreSelectedItems ? (
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.05)",
            backgroundColor: colors.primary_bg,
            border: "none",
            flexShrink: 0,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-scroller": {
                overflow: "hidden !important",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.95rem" },
                textTransform: "none",
                py: { xs: 1.5, sm: 2 },
                minHeight: { xs: 50, sm: 60 },
                minWidth: 0,
                padding: { xs: "8px", sm: "12px 16px" },
                whiteSpace: "nowrap",
                color: colors.secondary_text,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&.Mui-selected": {
                  color: colors.primary_accent,
                  transform: "scale(1.02)",
                },
                "&:hover": {
                  color: colors.primary_accent,
                  backgroundColor: `${colors.primary_accent}14`,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                backgroundColor: colors.primary_accent,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              "& .MuiTabs-flexContainer": {
                position: "relative",
              },
              transition: "background-color 0.3s ease",
            }}
          >
            {dataTypeOptions.map((option, index) => {
              return (
                <Tab
                  key={option.value}
                  icon={ICONS[option.value] || ICONS.EXPENSE}
                  iconPosition="start"
                  label={option.label}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.2s ease",
                    },
                    "&.Mui-selected .MuiSvgIcon-root": {
                      transform: option.value === "EXPENSE" ? "translateY(2px)" 
                                : option.value === "BUDGET" ? "translateY(-2px)" 
                                : "rotate(360deg)",
                    },
                  }}
                />
              );
            })}
          </Tabs>
        </Paper>
      ) : (
        // Pre-selected mode header
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: `${colors.primary_accent}0D`,
            borderRadius: "14px",
            border: `1px solid ${colors.primary_accent}35`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.2)"
              : "0 6px 18px rgba(15,23,42,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: `${colors.primary_accent}20`,
              color: colors.primary_accent,
            }}
          >
            {ICONS[preSelectedType] || ICONS.EXPENSE}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: colors.primary_text, fontWeight: 700 }}
            >
              Selected {preSelectedTypeLabel}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.placeholder_text, lineHeight: 1.5 }}
            >
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} imported from CashFlow and ready to share
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Toolbar: Search & Select All */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexWrap: { xs: "wrap", md: "nowrap" },
          flexShrink: 0,
          p: 1.25,
          borderRadius: "12px",
          backgroundColor: colors.card_bg,
          border: `1px solid ${colors.border_color}`,
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
                <SearchIcon sx={{ color: colors.secondary_text, fontSize: 20 }} />
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
              borderRadius: "12px",
              color: colors.primary_text,
              backgroundColor: colors.input_bg,
              "& fieldset": {
                borderColor: isDark
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.15)",
              },
              "&:hover fieldset": {
                borderColor: colors.primary_accent,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.primary_accent,
              },
            },
          }}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiInputBase-root": { minHeight: 44 },
          }}
        />

        {filterOptions && (
          <IconButton
            size="small"
            onClick={() => setFilterPanelOpen((v) => !v)}
            aria-label="Filter shareable items"
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              color: filterPanelOpen ? colors.primary_accent : colors.secondary_text,
              backgroundColor: filterPanelOpen
                ? `${colors.primary_accent}15`
                : colors.input_bg,
              border: `1px solid ${filterPanelOpen ? colors.primary_accent : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: filterPanelOpen
                  ? `${colors.primary_accent}25`
                  : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
              },
            }}
            title="Filter"
          >
            <FilterIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}

        <Button
          variant="outlined"
          size="medium"
          startIcon={allSelected ? <DeselectIcon /> : <SelectAllIcon />}
          onClick={onSelectAll}
          disabled={filteredItems.length === 0}
          aria-label={
            allSelected
              ? "Deselect all shareable items"
              : "Select all shareable items"
          }
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
            color: allSelected
              ? colors.primary_accent
              : colors.primary_text,
            borderColor: allSelected
              ? colors.primary_accent
              : isDark
                ? "rgba(255,255,255,0.18)"
                : "rgba(0,0,0,0.15)",
            backgroundColor: allSelected
              ? `${colors.primary_accent}18`
              : isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.02)",
            "& .MuiSvgIcon-root": {
              color: allSelected ? colors.primary_accent : colors.primary_text,
            },
            "&:hover": {
              backgroundColor: allSelected
                ? `${colors.primary_accent}28`
                : isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.06)",
              borderColor: colors.primary_accent,
              color: colors.primary_accent,
              "& .MuiSvgIcon-root": { color: colors.primary_accent },
            },
            "&.Mui-disabled": {
              color: colors.secondary_text,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
              backgroundColor: "transparent",
              "& .MuiSvgIcon-root": { color: colors.secondary_text },
            },
          }}
        >
          {allSelected ? "Deselect All" : `Select All (${filteredItems.length})`}
        </Button>
      </Box>

      {/* Items Grid */}
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: "auto",
          px: 0.5,
          pb: 1,
          minHeight: 300,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            borderRadius: "3px",
          },
        }}
      >
        {filteredItems.length === 0 ? (
          <Fade in timeout={500}>
            <Box sx={{ p: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.secondary_text,
                }}
              >
                <SearchIcon sx={{ fontSize: 40, opacity: 0.5 }} />
              </Box>
              <Typography sx={{ color: colors.secondary_text, fontSize: "1.1rem" }}>
                {searchTerm
                  ? `No ${resourceType.toLowerCase()}s match "${searchTerm}"`
                  : `No ${resourceType.toLowerCase()}s available to share`}
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Grid container spacing={2} alignItems="stretch">
            {filteredItems.map((item, idx) => {
              const isSelected = selectedItems.some(
                (selected) =>
                  selected.externalRef === item.externalRef ||
                  (selected.id != null &&
                    item.id != null &&
                    String(selected.id) === String(item.id)),
              );
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={item.externalRef}
                  sx={{ display: "flex" }}
                >
                  <Zoom in style={{ transitionDelay: `${Math.min(idx * 20, 300)}ms` }}>
                    <Card
                      onClick={() => onToggleItem(item)}
                      elevation={0}
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        height: "100%",
                        width: "100%",
                        minHeight: 128,
                        borderRadius: "14px",
                        border: `1px solid ${
                          isSelected
                            ? colors.primary_accent
                            : colors.border_color
                        }`,
                        backgroundColor: isSelected
                          ? `${colors.primary_accent}18`
                          : colors.card_bg,
                        transition: "all 0.2s ease-in-out",
                        boxShadow: isSelected
                          ? `0 8px 22px ${colors.primary_accent}22`
                          : isDark
                            ? "0 8px 22px rgba(0,0,0,0.24)"
                            : "0 6px 18px rgba(15,23,42,0.07)",
                        outline: "none",
                        "&:focus-visible": {
                          boxShadow: `0 0 0 3px ${colors.primary_accent}45`,
                        },
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: isSelected
                            ? `0 6px 16px ${colors.primary_accent}30`
                            : isDark
                              ? "0 6px 16px rgba(0,0,0,0.7)"
                              : "0 6px 16px rgba(0,0,0,0.1)",
                          borderColor: colors.primary_accent,
                          backgroundColor: isSelected
                            ? `${colors.primary_accent}20`
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : colors.hover_bg,
                        },
                      }}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onToggleItem(item);
                        }
                      }}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            color: colors.primary_accent,
                            backgroundColor: colors.primary_bg,
                            borderRadius: "50%",
                            display: "flex",
                            boxShadow: `0 0 0 3px ${colors.primary_accent}20`,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 22 }} />
                        </Box>
                      )}

                      <Box
                        sx={{
                          p: 2.25,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: "12px",
                            backgroundColor: isSelected
                              ? `${colors.primary_accent}22`
                              : colors.input_bg,
                            color: isSelected
                              ? colors.primary_accent
                              : colors.primary_text,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease-in-out",
                            "& svg": { fontSize: 24 },
                          }}
                        >
                          {ICONS[resourceType] || ICONS.EXPENSE}
                        </Box>
                        <Box sx={{ flex: 1, pr: isSelected ? 3 : 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: colors.primary_text,
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              lineHeight: 1.3,
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.displayName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.placeholder_text,
                              fontSize: "0.8rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3, gap: 1.5 }}>
            <CircularProgress size={20} sx={{ color: colors.primary_accent }} />
            <Typography variant="body2" sx={{ color: colors.secondary_text, fontWeight: 500 }}>
              Loading more...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Selection Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderRadius: "12px",
          backgroundColor: selectedItems.length > 0
            ? `${colors.primary_accent}15`
            : colors.card_bg,
          border: `1px solid ${
            selectedItems.length > 0
              ? `${colors.primary_accent}55`
              : colors.border_color
          }`,
          transition: "all 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor:
                selectedItems.length > 0
                  ? colors.primary_accent
                  : colors.input_bg,
              color: selectedItems.length > 0 ? "#fff" : colors.primary_text,
              border:
                selectedItems.length > 0
                  ? "none"
                  : `1px solid ${colors.border_color}`,
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: "inherit" }}
            >
              {selectedItems.length}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: selectedItems.length > 0 ? colors.primary_text : colors.secondary_text,
            }}
          >
            Item{selectedItems.length !== 1 ? "s" : ""} selected
          </Typography>
        </Box>
        {totalItems > 0 && !hasPreSelectedItems && (
          <Typography variant="body2" sx={{ color: colors.secondary_text, fontWeight: 500 }}>
            Showing {filteredItems.length} of {totalItems} total
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: "12px", flexShrink: 0 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ShareDataSelector;