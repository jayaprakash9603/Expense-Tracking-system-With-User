import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  InputBase,
  IconButton,
  Popper,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUniversalSearch } from "./useUniversalSearch";
import SearchResultItem from "./SearchResultItem";
import { SECTION_ORDER, SECTION_LABELS } from "./quickActions.config";

/**
 * InlineSearchBar - Expandable search bar in the header
 * Small by default, expands on click/focus with inline dropdown results
 */
const InlineSearchBar = () => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === "dark";
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localSelectedIndex, setLocalSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    query,
    loading,
    groupedResults,
    handleQueryChange,
    selectResult,
    allResults,
    setQuery,
  } = useUniversalSearch();

  // Reset selection when results change
  useEffect(() => {
    setLocalSelectedIndex(0);
  }, [query, allResults.length]);

  // Expand and focus on click
  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  // Handle blur - collapse if no query
  const handleBlur = (e) => {
    // Don't collapse if clicking within the results dropdown
    if (containerRef.current?.contains(e.relatedTarget)) {
      return;
    }
    setIsFocused(false);
    if (!query) {
      setTimeout(() => setIsExpanded(false), 200);
    }
  };

  // Close search
  const handleClose = () => {
    setQuery("");
    setIsExpanded(false);
    setIsFocused(false);
    setLocalSelectedIndex(0);
  };

  // Scroll selected item into view
  const scrollToSelected = (index) => {
    if (dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-result-index]");
      if (items[index]) {
        items[index].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  };

  // Local keyboard handler for inline search
  const handleLocalKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex =
        localSelectedIndex < allResults.length - 1 ? localSelectedIndex + 1 : 0;
      setLocalSelectedIndex(newIndex);
      setTimeout(() => scrollToSelected(newIndex), 0);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex =
        localSelectedIndex > 0 ? localSelectedIndex - 1 : allResults.length - 1;
      setLocalSelectedIndex(newIndex);
      setTimeout(() => scrollToSelected(newIndex), 0);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (allResults[localSelectedIndex]) {
        selectResult(allResults[localSelectedIndex]);
        handleClose();
      }
      return;
    }
  };

  // Note: Ctrl+K is handled by UniversalSearchModal for the big centered search
  // InlineSearchBar only handles click-to-expand for inline search

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isExpanded) {
          handleClose();
        }
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  // Check if we have any results
  const hasResults = Object.values(groupedResults).some(
    (results) => results && results.length > 0,
  );
  const showDropdown =
    isExpanded && isFocused && (query.length > 0 || hasResults);

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: "350px" }}>
      {/* Search Input Container - Fixed width to prevent layout shift */}
      <Box
        onClick={!isExpanded ? handleExpand : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          backgroundColor: isExpanded
            ? "transparent"
            : isDark
              ? "#1f2937" // bg-gray-800 - matches other header buttons
              : "#f3f4f6", // bg-gray-100 - matches other header buttons
          border: `1px solid ${
            isExpanded
              ? isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.15)"
              : "transparent"
          }`,
          cursor: isExpanded ? "text" : "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          width: isExpanded ? "100%" : "36px", // Expand to full container width
          height: "36px",
          overflow: "hidden",
          marginLeft: isExpanded ? 0 : "auto", // Push icon to right when collapsed
          "&:hover": {
            backgroundColor: isExpanded
              ? "transparent"
              : isDark
                ? "#374151" // bg-gray-700 - matches other header buttons hover
                : "#e5e7eb", // bg-gray-200 - matches other header buttons hover
            transform: isExpanded ? "none" : "scale(1.1)", // Match hover scale effect
          },
        }}
      >
        {/* Search Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "36px",
            height: "36px",
          }}
        >
          <SearchIcon
            sx={{
              fontSize: "20px",
              color: isDark ? "#d1d5db" : "#374151", // text-gray-300 / text-gray-700 - matches other header icons
            }}
          />
        </Box>

        {/* Input Field - shown when expanded */}
        {isExpanded && (
          <>
            <InputBase
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleLocalKeyDown}
              placeholder={t("search.placeholder") || "Search..."}
              sx={{
                flex: 1,
                fontSize: "13px",
                color: isDark ? "#fff" : "#333",
                "& input": {
                  padding: 0,
                  "&::placeholder": {
                    color: isDark ? "rgba(255, 255, 255, 0.5)" : "#999",
                    opacity: 1,
                  },
                },
              }}
            />

            {/* Loading indicator or close button */}
            {loading ? (
              <CircularProgress
                size={16}
                sx={{ mr: 1, color: isDark ? "#888" : "#666" }}
              />
            ) : query ? (
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                  mr: 0.5,
                  p: 0.5,
                  color: isDark ? "#888" : "#666",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            ) : (
              // Keyboard shortcut hint
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  mr: 1,
                }}
              >
                <Box
                  sx={{
                    padding: "1px 4px",
                    borderRadius: "3px",
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: isDark ? "#888" : "#666",
                  }}
                >
                  {isMac ? "⌘" : "Ctrl"}
                </Box>
                <Box
                  sx={{
                    padding: "1px 4px",
                    borderRadius: "3px",
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: isDark ? "#888" : "#666",
                  }}
                >
                  K
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Results Dropdown */}
      {showDropdown && (
        <Paper
          ref={dropdownRef}
          elevation={8}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "350px",
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: "12px",
            backgroundColor: isDark ? "#121212" : "#fff", // Darker background for dark theme
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
            zIndex: 1300,
            padding: 0, // Remove default Paper padding
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#555" : "#ccc",
              borderRadius: "3px",
            },
          }}
        >
          {/* No results state */}
          {query.length >= 2 && !hasResults && !loading && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography
                sx={{
                  color: isDark ? "rgba(255, 255, 255, 0.7)" : "#666",
                  fontSize: "13px",
                }}
              >
                {t("search.noResults") || "No results found"}
              </Typography>
            </Box>
          )}

          {/* Results grouped by section */}
          {SECTION_ORDER.map((sectionKey) => {
            const results = groupedResults[sectionKey];
            if (!results || results.length === 0) return null;

            return (
              <Box key={sectionKey}>
                {/* Section Header */}
                <Typography
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: isDark ? "#00dac6" : "#0d9488", // Use theme accent color
                    backgroundColor: isDark
                      ? "#121212" // Match dropdown bg
                      : "rgba(0, 0, 0, 0.02)",
                    borderBottom: `1px solid ${
                      isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)"
                    }`,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {t(SECTION_LABELS[sectionKey]) ||
                    t(`search.sections.${sectionKey}`) ||
                    sectionKey}
                </Typography>

                {/* Section Results */}
                {results.map((result, idx) => {
                  // Calculate global index for selection
                  let globalIndex = 0;
                  for (const key of SECTION_ORDER) {
                    if (key === sectionKey) break;
                    globalIndex += (groupedResults[key] || []).length;
                  }
                  globalIndex += idx;

                  return (
                    <Box
                      key={result.id || `${sectionKey}-${idx}`}
                      data-result-index={globalIndex}
                      onMouseDown={(e) => {
                        // Prevent blur and handle click
                        e.preventDefault();
                        e.stopPropagation();
                        selectResult(result);
                        handleClose();
                      }}
                    >
                      <SearchResultItem
                        result={result}
                        isSelected={localSelectedIndex === globalIndex}
                        isDark={isDark}
                        query={query}
                      />
                    </Box>
                  );
                })}
              </Box>
            );
          })}

          {/* Hint footer */}
          {hasResults && (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderTop: `1px solid ${
                  isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: "4px",
                    backgroundColor: isDark
                      ? "rgba(0, 218, 198, 0.15)"
                      : "rgba(0, 0, 0, 0.06)",
                    fontSize: "10px",
                    color: isDark ? "#00dac6" : "#666",
                  }}
                >
                  ↑↓
                </Box>
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: isDark ? "rgba(255, 255, 255, 0.6)" : "#999",
                  }}
                >
                  {t("search.navigate") || "Navigate"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: "4px",
                    backgroundColor: isDark
                      ? "rgba(0, 218, 198, 0.15)"
                      : "rgba(0, 0, 0, 0.06)",
                    fontSize: "10px",
                    color: isDark ? "#00dac6" : "#666",
                  }}
                >
                  ↵
                </Box>
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: isDark ? "rgba(255, 255, 255, 0.6)" : "#999",
                  }}
                >
                  {t("search.select") || "Select"}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default InlineSearchBar;
