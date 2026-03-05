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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Segmented Control Tabs */}
      {!hasPreSelectedItems ? (
        <Paper
          sx={{
            mb: 3,
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
            mb: 3,
            p: 2,
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: `${colors.primary_accent}20`,
              color: colors.primary_accent,
            }}
          >
            {ICONS[preSelectedType] || ICONS.EXPENSE}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: colors.primary_text, fontWeight: 600 }}>
              Selected {preSelectedTypeLabel}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} from CashFlow
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Toolbar: Search & Select All */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
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
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
              "& fieldset": {
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              },
              "&:hover fieldset": {
                borderColor: colors.primary_accent,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.primary_accent,
              },
            },
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />

        {filterOptions && (
          <IconButton
            size="small"
            onClick={() => setFilterPanelOpen((v) => !v)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              color: filterPanelOpen ? colors.primary_accent : colors.secondary_text,
              backgroundColor: filterPanelOpen
                ? `${colors.primary_accent}15`
                : isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
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
          sx={{
            height: 40,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            color: allSelected ? colors.primary_accent : colors.secondary_text,
            borderColor: allSelected ? colors.primary_accent : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            backgroundColor: allSelected ? `${colors.primary_accent}10` : isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
            "&:hover": {
              backgroundColor: allSelected ? `${colors.primary_accent}20` : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
              borderColor: allSelected ? colors.primary_accent : isDark ? "rgba(255,255,255,0.2)" : colors.primary_text,
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
          mx: -1, // Negative margin to allow card shadows to display without clipping
          px: 1,
          pb: 2,
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
          <Grid container spacing={2}>
            {filteredItems.map((item, idx) => {
              const isSelected = selectedItems.some((i) => i.externalRef === item.externalRef);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.externalRef}>
                  <Zoom in style={{ transitionDelay: `${Math.min(idx * 20, 300)}ms` }}>
                    <Card
                      onClick={() => onToggleItem(item)}
                      elevation={0}
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        height: "100%",
                        borderRadius: "16px",
                        border: `2px solid ${isSelected ? colors.primary_accent : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                        backgroundColor: isSelected
                          ? `${colors.primary_accent}15`
                          : isDark
                            ? "rgba(255,255,255,0.05)"
                            : colors.card_bg || "#ffffff",
                        transition: "all 0.2s ease-in-out",
                        boxShadow: isSelected
                          ? `0 4px 12px ${colors.primary_accent}20`
                          : isDark
                            ? "0 4px 12px rgba(0,0,0,0.5)"
                            : "0 2px 10px rgba(0,0,0,0.05)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: isSelected
                            ? `0 6px 16px ${colors.primary_accent}30`
                            : isDark
                              ? "0 6px 16px rgba(0,0,0,0.7)"
                              : "0 6px 16px rgba(0,0,0,0.1)",
                          borderColor: isSelected ? colors.primary_accent : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                          backgroundColor: isSelected
                            ? `${colors.primary_accent}20`
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : colors.card_bg || "#ffffff",
                        },
                      }}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            color: colors.primary_accent,
                            backgroundColor: isDark ? "#000" : "#fff",
                            borderRadius: "50%",
                            display: "flex",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 22 }} />
                        </Box>
                      )}

                      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            backgroundColor: isSelected
                              ? `${colors.primary_accent}20`
                              : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            color: isSelected ? colors.primary_accent : isDark ? "rgba(255,255,255,0.7)" : colors.secondary_text,
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
                              color: isDark ? "#ffffff" : colors.primary_text,
                              fontWeight: 600,
                              fontSize: "0.95rem",
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
                              color: isDark ? "rgba(255,255,255,0.7)" : colors.secondary_text,
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
          mt: 2,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderRadius: "16px",
          backgroundColor: selectedItems.length > 0 
            ? `${colors.primary_accent}10` 
            : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1px solid ${selectedItems.length > 0 ? `${colors.primary_accent}30` : "transparent"}`,
          transition: "all 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: selectedItems.length > 0 ? colors.primary_accent : colors.secondary_text,
              color: "#fff",
              transition: "all 0.3s ease",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
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