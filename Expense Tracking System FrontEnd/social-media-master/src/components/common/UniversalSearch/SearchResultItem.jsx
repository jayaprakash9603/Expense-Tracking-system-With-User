import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { TYPE_ICONS, SEARCH_TYPES } from "./quickActions.config";

/**
 * Highlight ALL matching text occurrences in search results
 * Supports fuzzy matching by highlighting each character match
 */
const HighlightedText = ({ text, query, isDark }) => {
  if (!query || !text) {
    return <span>{text}</span>;
  }

  const queryLower = query.toLowerCase().trim();
  const textStr = String(text);
  const textLower = textStr.toLowerCase();

  // First try exact substring match (highlight all occurrences)
  if (textLower.includes(queryLower)) {
    const parts = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while ((searchIndex = textLower.indexOf(queryLower, lastIndex)) !== -1) {
      // Add text before match
      if (searchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {textStr.slice(lastIndex, searchIndex)}
          </span>,
        );
      }
      // Add highlighted match
      parts.push(
        <span
          key={`match-${searchIndex}`}
          style={{
            color: isDark ? "#5eead4" : "#0d9488",
            fontWeight: 600,
          }}
        >
          {textStr.slice(searchIndex, searchIndex + queryLower.length)}
        </span>,
      );
      lastIndex = searchIndex + queryLower.length;
    }

    // Add remaining text
    if (lastIndex < textStr.length) {
      parts.push(<span key={`text-end`}>{textStr.slice(lastIndex)}</span>);
    }

    return <span>{parts}</span>;
  }

  // Fuzzy matching - highlight each matching character in sequence
  const matchIndices = [];
  let queryIdx = 0;

  for (let i = 0; i < textLower.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIdx]) {
      matchIndices.push(i);
      queryIdx++;
    }
  }

  // If we didn't match all query chars, no highlight
  if (queryIdx < queryLower.length) {
    return <span>{textStr}</span>;
  }

  // Build highlighted result
  const matchSet = new Set(matchIndices);
  const parts = [];
  let i = 0;

  while (i < textStr.length) {
    if (!matchSet.has(i)) {
      // Non-matching span
      const start = i;
      while (i < textStr.length && !matchSet.has(i)) i++;
      parts.push(<span key={`t-${start}`}>{textStr.slice(start, i)}</span>);
    } else {
      // Matching span (group consecutive matches)
      const start = i;
      while (i < textStr.length && matchSet.has(i)) i++;
      parts.push(
        <span
          key={`m-${start}`}
          style={{
            color: isDark ? "#5eead4" : "#0d9488",
            fontWeight: 600,
          }}
        >
          {textStr.slice(start, i)}
        </span>,
      );
    }
  }

  return <span>{parts}</span>;
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
          backgroundColor: isSelected
            ? isDark
              ? "rgba(20, 184, 166, 0.15)"
              : "rgba(20, 184, 166, 0.1)"
            : isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
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
              color: isDark ? "rgba(255, 255, 255, 0.6)" : "#666",
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
              ? "rgba(0, 218, 198, 0.15)" // Teal tint for dark mode
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
              color: isDark ? "#00dac6" : "#0d9488", // Theme accent color
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
