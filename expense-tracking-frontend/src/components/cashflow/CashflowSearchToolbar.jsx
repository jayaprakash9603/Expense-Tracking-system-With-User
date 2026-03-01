import React from "react";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

// Search + filter toolbar for CashFlow-like pages
// Props: search (string), setSearch (fn), onFilterClick (fn), filterRef (ref), isMobile (bool), isTablet (bool)
const CashflowSearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
  isMobile,
  isTablet,
}) => {
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
        placeholder="Search expenses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          backgroundColor: "var(--mui-palette-background-paper, #1b1b1b)",
          color: "var(--mui-palette-text-primary, #ffffff)",
          borderRadius: 8,
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          border: "1px solid var(--mui-palette-primary-main, #00dac6)",
          padding: isMobile ? "6px 10px" : "8px 16px",
          width: "100%",
          outline: "none",
        }}
      />
      <IconButton
        sx={{ color: "var(--mui-palette-primary-main, #00dac6)", flexShrink: 0, p: isMobile ? 0.5 : 1 }}
        onClick={onFilterClick}
        ref={filterRef}
      >
        <FilterListIcon fontSize={isMobile ? "small" : "small"} />
      </IconButton>
    </div>
  );
};

export default CashflowSearchToolbar;
