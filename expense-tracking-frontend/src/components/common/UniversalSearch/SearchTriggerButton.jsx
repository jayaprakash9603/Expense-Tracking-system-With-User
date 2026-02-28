import React from "react";
import { Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUniversalSearch } from "./useUniversalSearch";

/**
 * SearchTriggerButton - Clickable button to open Universal Search
 * Displays keyboard shortcut hint (Cmd/Ctrl + K)
 */
const SearchTriggerButton = ({ compact = false }) => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const { openSearch } = useUniversalSearch();

  const isDark = mode === "dark";
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (compact) {
    // Compact version - just icon button
    return (
      <button
        onClick={openSearch}
        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        title={`${t("search.openSearch") || "Search"} (${isMac ? "⌘" : "Ctrl"}+K)`}
      >
        <SearchIcon
          className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          style={{ fontSize: "20px" }}
        />
      </button>
    );
  }

  // Full version - with text and shortcut
  return (
    <Box
      onClick={openSearch}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "10px",
        backgroundColor: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "200px",
        "&:hover": {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.06)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <SearchIcon
        sx={{
          fontSize: "18px",
          color: isDark ? "#888" : "#666",
        }}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: "13px",
          color: isDark ? "#888" : "#666",
        }}
      >
        {t("search.placeholder") || "Search..."}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Box
          sx={{
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.08)",
            fontSize: "11px",
            fontWeight: 500,
            color: isDark ? "#aaa" : "#666",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {isMac ? "⌘" : "Ctrl"}
        </Box>
        <Box
          sx={{
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.08)",
            fontSize: "11px",
            fontWeight: 500,
            color: isDark ? "#aaa" : "#666",
          }}
        >
          K
        </Box>
      </Box>
    </Box>
  );
};

export default SearchTriggerButton;
