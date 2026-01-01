import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getThemeColors, getIconFilter } from "../../config/themeConfig";

const CASHFLOW_VIEW_STATE_PREFIX = "cashflow:view-state:";
const CATEGORY_FLOW_VIEW_STATE_PREFIX = "categoryflow:view-state:";

const isCashflowRoute = (pathname = "") => pathname.includes("/expenses");
const isCategoryFlowRoute = (pathname = "") =>
  pathname.includes("/category-flow");

const clearCachedViewStateByPrefix = (prefix) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  const keysToRemove = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};
const clearCachedCashflowViewState = () =>
  clearCachedViewStateByPrefix(CASHFLOW_VIEW_STATE_PREFIX);
const clearCachedCategoryFlowViewState = () =>
  clearCachedViewStateByPrefix(CATEGORY_FLOW_VIEW_STATE_PREFIX);

const MenuItem = ({ name, path, icon, onClick, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

  const isActive = location.pathname === path;

  const handleClick = () => {
    if (onClick) {
      onClick(); // Custom action (e.g., logout)
    } else {
      const leavingCashflow =
        isCashflowRoute(location.pathname) && !isCashflowRoute(path);
      if (leavingCashflow) {
        clearCachedCashflowViewState();
      }
      const leavingCategoryFlow =
        isCategoryFlowRoute(location.pathname) && !isCategoryFlowRoute(path);
      if (leavingCategoryFlow) {
        clearCachedCategoryFlowViewState();
      }
      // Always pass fromSidebar state so target pages know origin
      navigate(path, { state: { fromSidebar: true } });
    }
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Check if icon is a React component or a string (image URL)
  const isReactComponent = typeof icon === "function" || (icon && icon.type);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-start w-full max-w-[360px] h-[52px] cursor-pointer rounded-lg overflow-hidden transition-all duration-200 pl-6`}
      style={{
        backgroundColor: isActive ? themeColors.active_bg : "transparent",
        color: isActive ? themeColors.active_text : themeColors.primary_text,
      }}
    >
      <span className="flex items-center flex-row-reverse px-3 w-full">
        <div className="flex-grow text-left font-bold text-[16px] leading-[20px] whitespace-nowrap">
          {name}
        </div>

        {icon && (
          <>
            {isReactComponent ? (
              // Render React icon component
              <span
                className="mr-3"
                style={{
                  color: isActive
                    ? themeColors.active_text
                    : themeColors.primary_text,
                }}
              >
                {icon}
              </span>
            ) : (
              // Render image icon
              <img
                src={icon}
                alt={`${name} icon`}
                className="w-[22px] h-[22px] object-contain mr-3"
                style={{
                  filter: getIconFilter(mode, isActive),
                }}
              />
            )}
          </>
        )}
      </span>
    </div>
  );
};

export default MenuItem;
