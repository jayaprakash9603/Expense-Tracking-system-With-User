import React from "react";
import SearchToolbar from "../common/SearchToolbar";
import NavigationActions from "./NavigationActions";
import { useTheme } from "../../hooks/useTheme";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * Combined search input + navigation / add-new action bar.
 * Encapsulates layout & hover styles previously inline in flow pages.
 */
const SearchNavigationBar = ({
  search,
  setSearch,
  onFilterToggle,
  filterRef,
  isMobile,
  isTablet,
  navItems = [],
  friendId,
  isFriendView,
  hasWriteAccess,
  navigate,
  addNewOptions = [],
  placeholder,
  currentFlow,
  autocompleteOptions = [],
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("cashflow.searchPlaceholder");

  return (
    <div
      className="flex items-center mt-2 mb-2"
      style={{
        width: "100%",
        justifyContent: "flex-start",
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: isMobile ? 8 : 0,
      }}
    >
      <SearchToolbar
        search={search}
        setSearch={setSearch}
        onFilterClick={onFilterToggle}
        filterRef={filterRef}
        isMobile={isMobile}
        isTablet={isTablet}
        placeholder={resolvedPlaceholder}
        autocompleteOptions={autocompleteOptions}
      />

      <NavigationActions
        items={navItems}
        friendId={friendId}
        isFriendView={isFriendView}
        hasWriteAccess={hasWriteAccess}
        navigate={navigate}
        addNewOptions={addNewOptions}
        isMobile={isMobile}
        currentFlow={currentFlow}
      />

      <style>{`
        .nav-button:hover {
          background-color: ${colors.button_hover} !important;
          color: ${colors.button_text} !important;
          border-color: ${colors.button_hover} !important;
        }
        .nav-button:hover img {
          filter: brightness(0) saturate(100%) ${
            colors.mode === "dark" ? "invert(0%)" : "invert(100%)"
          } !important;
        }
        .nav-button:hover svg circle,
        .nav-button:hover svg path {
          stroke: ${colors.button_text} !important;
        }
        .nav-button:hover span {
          color: ${colors.button_text} !important;
        }
        .nav-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default SearchNavigationBar;
