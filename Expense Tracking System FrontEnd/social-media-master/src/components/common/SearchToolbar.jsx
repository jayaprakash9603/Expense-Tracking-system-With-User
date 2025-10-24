import React from "react";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "../../hooks/useTheme";

/**
 * Generic search + filter toolbar.
 * Props:
 *  - search: current search string
 *  - setSearch: setter function for search
 *  - onFilterClick: handler when filter icon clicked
 *  - filterRef: ref passed to IconButton (for popover anchoring)
 *  - isMobile, isTablet: responsive sizing booleans
 *  - placeholder: custom placeholder text (defaults to 'Search...')
 */
const SearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
  isMobile,
  isTablet,
  placeholder = "Search...",
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: isMobile ? 6 : 8,
        alignItems: "center",
        width: "100%",
        maxWidth: isMobile ? "220px" : isTablet ? "280px" : "320px",
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
          borderRadius: 8,
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          border: `1px solid ${colors.active_text}`,
          padding: isMobile ? "6px 10px" : "8px 16px",
          width: "100%",
          outline: "none",
        }}
      />
      <IconButton
        sx={{ color: colors.active_text, flexShrink: 0, p: isMobile ? 0.5 : 1 }}
        onClick={onFilterClick}
        ref={filterRef}
      >
        <FilterListIcon fontSize={isMobile ? "small" : "small"} />
      </IconButton>
    </div>
  );
};

export default SearchToolbar;
