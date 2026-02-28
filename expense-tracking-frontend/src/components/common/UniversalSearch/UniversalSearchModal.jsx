import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUniversalSearch } from "./useUniversalSearch";
import SearchResultItem from "./SearchResultItem";
import {
  SECTION_LABELS,
  TYPE_ICONS,
  SEARCH_TYPES,
} from "./quickActions.config";
import UserSettingsHelper from "../../../utils/UserSettingsHelper";
import { formatDate } from "../../../utils/dateFormatter";

/**
 * UniversalSearchModal - Spotlight-like search overlay
 * Provides global search across all entities in the expense tracking system
 */
const UniversalSearchModal = () => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Get user settings at parent level for performance
  const userCurrency = useSelector(
    (state) => state.userSettings?.settings?.currency || "INR",
  );
  const dateFormat = useSelector(
    (state) => state.userSettings?.settings?.dateFormat || "DD/MM/YYYY",
  );

  const {
    isOpen,
    query,
    loading,
    error,
    selectedIndex,
    groupedResults,
    allResults,
    openSearch,
    closeSearch,
    handleQueryChange,
    handleKeyDown,
    selectResult,
    setSelectedIndex,
  } = useUniversalSearch();

  const isDark = mode === "dark";

  // Helper to format amount and date for search results
  const getFormattedAmountDate = useCallback(
    (result) => {
      const isExpenseOrBill =
        result.type === SEARCH_TYPES.EXPENSE ||
        result.type === SEARCH_TYPES.BILL;
      if (!isExpenseOrBill)
        return { formattedAmount: null, formattedDate: null, isGain: false };

      const amount = result.metadata?.amount;
      const date =
        result.type === SEARCH_TYPES.BILL
          ? result.metadata?.dueDate
          : result.metadata?.date;

      // Check if expense is a gain (type = "Gain") or loss (type = "Loss")
      const expenseType = result.metadata?.type;
      const isGain = expenseType?.toLowerCase() === "gain";

      return {
        formattedAmount:
          amount != null
            ? UserSettingsHelper.formatCurrency(amount, userCurrency)
            : null,
        formattedDate: date ? formatDate(date, dateFormat) : null,
        isGain,
      };
    },
    [userCurrency, dateFormat],
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsContainerRef.current && selectedIndex >= 0) {
      const selectedElement = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Calculate flat index for each result across sections
  const flatIndexMap = useMemo(() => {
    const map = new Map();
    let index = 0;
    Object.keys(groupedResults).forEach((section) => {
      groupedResults[section].forEach((result) => {
        map.set(`${section}-${result.id}`, index);
        index++;
      });
    });
    return map;
  }, [groupedResults]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  // Get section label
  const getSectionLabel = (section) => {
    const key = SECTION_LABELS[section];
    if (key) {
      const translated = t(key);
      // If translation returns the key, use a fallback
      return translated !== key
        ? translated
        : section.charAt(0).toUpperCase() + section.slice(1).replace("_", " ");
    }
    return section.charAt(0).toUpperCase() + section.slice(1).replace("_", " ");
  };

  if (!isOpen) {
    return null;
  }

  const hasResults = Object.keys(groupedResults).length > 0;
  const showEmptyState = query.length >= 2 && !hasResults && !loading;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={handleBackdropClick}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "10vh",
        }}
      >
        {/* Search Modal */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "640px",
            maxHeight: "70vh",
            margin: "0 16px",
            backgroundColor: colors.card_bg,
            borderRadius: "16px",
            boxShadow: isDark
              ? `0 25px 50px -12px ${colors.shadow_color}, 0 0 0 1px ${colors.border_light}`
              : `0 25px 50px -12px ${colors.shadow_color}, 0 0 0 1px ${colors.border_color}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: `1px solid ${colors.border_color}`,
              gap: "12px",
            }}
          >
            <SearchIcon
              sx={{
                color: colors.icon_muted,
                fontSize: "24px",
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                t("search.placeholder") ||
                "Search expenses, budgets, actions..."
              }
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                fontSize: "16px",
                color: colors.primary_text,
                fontFamily: "inherit",
              }}
              autoComplete="off"
              spellCheck="false"
            />
            {/* Loading indicator - only shown when API is fetching */}
            {loading && (
              <CircularProgress
                size={20}
                sx={{ color: colors.primary_accent }}
              />
            )}
            {/* Clear button - always shown when there's a query */}
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: "18px",
                    color: colors.icon_muted,
                    "&:hover": {
                      color: colors.primary_text,
                    },
                  }}
                />
              </button>
            )}
          </Box>

          {/* Results Section */}
          <Box
            ref={resultsContainerRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(70vh - 120px)",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: colors.scrollbar_thumb,
                borderRadius: "4px",
              },
            }}
          >
            {/* Loading Skeleton */}
            {loading && query.length >= 2 && !hasResults && (
              <Box sx={{ padding: "16px 20px" }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: colors.skeleton_base,
                        animation: "pulse 1.5s infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.5 },
                        },
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          width: "60%",
                          height: "16px",
                          borderRadius: "4px",
                          backgroundColor: colors.skeleton_base,
                          marginBottom: "8px",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                      <Box
                        sx={{
                          width: "40%",
                          height: "12px",
                          borderRadius: "4px",
                          backgroundColor: colors.skeleton_base,
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Empty State */}
            {showEmptyState && (
              <Box
                sx={{
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: "48px",
                    color: colors.icon_muted,
                    marginBottom: "16px",
                  }}
                />
                <Typography
                  sx={{
                    color: colors.placeholder_text,
                    fontSize: "14px",
                  }}
                >
                  {t("search.noResults") || "No results found"}
                </Typography>
                <Typography
                  sx={{
                    color: colors.icon_muted,
                    fontSize: "12px",
                    marginTop: "8px",
                  }}
                >
                  {t("search.tryDifferent") || "Try a different search term"}
                </Typography>
              </Box>
            )}

            {/* Results by Section */}
            {Object.keys(groupedResults).map((section) => (
              <Box key={section} sx={{ marginBottom: "8px" }}>
                {/* Section Header */}
                <Box
                  sx={{
                    padding: "8px 20px 4px",
                    position: "sticky",
                    top: 0,
                    backgroundColor: colors.card_bg,
                    zIndex: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: colors.placeholder_text,
                    }}
                  >
                    {getSectionLabel(section)}
                  </Typography>
                </Box>

                {/* Section Items */}
                <Box sx={{ padding: "0 8px" }}>
                  {groupedResults[section].map((result) => {
                    const flatIndex = flatIndexMap.get(
                      `${section}-${result.id}`,
                    );
                    const { formattedAmount, formattedDate, isGain } =
                      getFormattedAmountDate(result);
                    return (
                      <SearchResultItem
                        key={`${section}-${result.id}`}
                        result={result}
                        isSelected={flatIndex === selectedIndex}
                        onClick={() => selectResult(result)}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                        isDark={isDark}
                        colors={colors}
                        query={query}
                        dataIndex={flatIndex}
                        formattedAmount={formattedAmount}
                        formattedDate={formattedDate}
                        isGain={isGain}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}

            {/* Default State - No Query */}
            {!query && !hasResults && (
              <Box sx={{ padding: "16px 20px" }}>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: colors.placeholder_text,
                    marginBottom: "8px",
                  }}
                >
                  {t("search.suggestions") || "Suggestions"}
                </Typography>
                <Typography
                  sx={{
                    color: colors.icon_muted,
                    fontSize: "13px",
                  }}
                >
                  {t("search.typeToSearch") || "Start typing to search..."}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer with Keyboard Shortcuts */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderTop: `1px solid ${colors.border_color}`,
              backgroundColor: colors.secondary_bg,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Chip
                  size="small"
                  label="↑↓"
                  sx={{
                    height: "20px",
                    fontSize: "10px",
                    backgroundColor: colors.button_inactive,
                    color: colors.placeholder_text,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: colors.icon_muted,
                  }}
                >
                  {t("search.navigate") || "Navigate"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Chip
                  size="small"
                  label="↵"
                  sx={{
                    height: "20px",
                    fontSize: "10px",
                    backgroundColor: colors.button_inactive,
                    color: colors.placeholder_text,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: colors.icon_muted,
                  }}
                >
                  {t("search.select") || "Select"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Chip
                  size="small"
                  label="Esc"
                  sx={{
                    height: "20px",
                    fontSize: "10px",
                    backgroundColor: colors.button_inactive,
                    color: colors.placeholder_text,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: colors.icon_muted,
                  }}
                >
                  {t("search.close") || "Close"}
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "11px",
                color: colors.primary_accent,
                fontWeight: 500,
              }}
            >
              {t("search.poweredBy") || "Universal Search"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UniversalSearchModal;
