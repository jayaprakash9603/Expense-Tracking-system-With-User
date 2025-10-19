import React from "react";
import SearchToolbar from "../common/SearchToolbar";
import NavigationActions from "./NavigationActions";

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
  placeholder = "Search expenses...",
}) => {
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
        placeholder={placeholder}
      />

      <NavigationActions
        items={navItems}
        friendId={friendId}
        isFriendView={isFriendView}
        hasWriteAccess={hasWriteAccess}
        navigate={navigate}
        addNewOptions={addNewOptions}
        isMobile={isMobile}
      />

      <style>{`
        .nav-button:hover {
          background-color: #00dac6 !important;
          color: #000 !important;
          border-color: #00dac6 !important;
        }
        .nav-button:hover img {
          filter: brightness(0) saturate(100%) invert(0%) !important;
        }
        .nav-button:hover svg circle,
        .nav-button:hover svg path {
          stroke: #000 !important;
        }
        .nav-button:hover span {
          color: #000 !important;
        }
        .nav-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default SearchNavigationBar;
