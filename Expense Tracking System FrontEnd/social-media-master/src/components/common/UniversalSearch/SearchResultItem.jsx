import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { TYPE_ICONS, SEARCH_TYPES } from "./quickActions.config";

/**
 * Highlight matching text in search results
 */
const HighlightedText = ({ text, query, isDark }) => {
  if (!query || !text) {
    return <span>{text}</span>;
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);

  if (index === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <span>
      {before}
      <span
        style={{
          backgroundColor: isDark
            ? "rgba(20, 184, 166, 0.3)"
            : "rgba(20, 184, 166, 0.2)",
          color: isDark ? "#5eead4" : "#0d9488",
          borderRadius: "2px",
          padding: "0 2px",
        }}
      >
        {match}
      </span>
      {after}
    </span>
  );
};

/**
 * Get icon for result type
 */
const getResultIcon = (result) => {
  // Use custom icon if provided
  if (result.icon) {
    return result.icon;
  }

  // Use type-based icon
  return TYPE_ICONS[result.type] || "📄";
};

/**
 * Get icon background color based on result type
 */
const getIconBackground = (result, isDark) => {
  const typeColors = {
    [SEARCH_TYPES.EXPENSE]: isDark
      ? "rgba(239, 68, 68, 0.2)"
      : "rgba(239, 68, 68, 0.1)",
    [SEARCH_TYPES.BUDGET]: isDark
      ? "rgba(59, 130, 246, 0.2)"
      : "rgba(59, 130, 246, 0.1)",
    [SEARCH_TYPES.CATEGORY]: isDark
      ? "rgba(168, 85, 247, 0.2)"
      : "rgba(168, 85, 247, 0.1)",
    [SEARCH_TYPES.BILL]: isDark
      ? "rgba(249, 115, 22, 0.2)"
      : "rgba(249, 115, 22, 0.1)",
    [SEARCH_TYPES.PAYMENT_METHOD]: isDark
      ? "rgba(34, 197, 94, 0.2)"
      : "rgba(34, 197, 94, 0.1)",
    [SEARCH_TYPES.FRIEND]: isDark
      ? "rgba(236, 72, 153, 0.2)"
      : "rgba(236, 72, 153, 0.1)",
    [SEARCH_TYPES.ACTION]: isDark
      ? "rgba(20, 184, 166, 0.2)"
      : "rgba(20, 184, 166, 0.1)",
    [SEARCH_TYPES.REPORT]: isDark
      ? "rgba(99, 102, 241, 0.2)"
      : "rgba(99, 102, 241, 0.1)",
    [SEARCH_TYPES.SETTING]: isDark
      ? "rgba(107, 114, 128, 0.2)"
      : "rgba(107, 114, 128, 0.1)",
  };

  // Use custom color if provided
  if (result.color) {
    return result.color + (isDark ? "33" : "1a"); // Add opacity
  }

  return (
    typeColors[result.type] ||
    (isDark ? "rgba(107, 114, 128, 0.2)" : "rgba(107, 114, 128, 0.1)")
  );
};

/**
 * SearchResultItem - Individual search result item
 */
const SearchResultItem = ({
  result,
  isSelected,
  onClick,
  onMouseEnter,
  isDark,
  query,
  dataIndex,
}) => {
  const icon = useMemo(() => getResultIcon(result), [result]);
  const iconBg = useMemo(
    () => getIconBackground(result, isDark),
    [result, isDark],
  );

  return (
    <Box
      data-index={dataIndex}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        backgroundColor: isSelected
          ? isDark
            ? "rgba(20, 184, 166, 0.15)"
            : "rgba(20, 184, 166, 0.1)"
          : "transparent",
        border: isSelected
          ? `1px solid ${isDark ? "rgba(20, 184, 166, 0.3)" : "rgba(20, 184, 166, 0.2)"}`
          : "1px solid transparent",
        transition: "all 0.15s ease",
        "&:hover": {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)",
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: isDark ? "#fff" : "#1a1a1a",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <HighlightedText text={result.title} query={query} isDark={isDark} />
        </Typography>
        {result.subtitle && (
          <Typography
            sx={{
              fontSize: "12px",
              color: isDark ? "#888" : "#666",
              lineHeight: 1.3,
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <HighlightedText
              text={result.subtitle}
              query={query}
              isDark={isDark}
            />
          </Typography>
        )}
      </Box>

      {/* Type Badge (for non-action items) */}
      {result.type !== SEARCH_TYPES.ACTION && (
        <Box
          sx={{
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              color: isDark ? "#666" : "#999",
            }}
          >
            {result.type?.toLowerCase().replace("_", " ")}
          </Typography>
        </Box>
      )}

      {/* Arrow indicator for selected item */}
      {isSelected && (
        <Box
          sx={{
            color: isDark ? "#14b8a6" : "#0d9488",
            fontSize: "16px",
            flexShrink: 0,
          }}
        >
          →
        </Box>
      )}
    </Box>
  );
};

export default SearchResultItem;
