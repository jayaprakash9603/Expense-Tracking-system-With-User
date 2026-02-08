import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { ShortcutBadge } from "../../features/keyboard";

// Mapping of paths to shortcut action IDs
const PATH_TO_SHORTCUT = {
  "/dashboard": "GO_DASHBOARD",
  "/expenses": "GO_EXPENSES",
  "/budget": "GO_BUDGETS",
  "/category-flow": "GO_CATEGORIES",
  "/payment-method": "GO_PAYMENTS",
  "/friends": "GO_FRIENDS",
  "/reports": "GO_REPORTS",
  "/settings": "GO_SETTINGS",
  "/bill": "GO_BILLS",
};

// Mapping of paths to shortcut data attributes for Alt-key overlay
const PATH_TO_SHORTCUT_ATTR = {
  "/dashboard": "dashboard",
  "/expenses": "expenses",
  "/budget": "budgets",
  "/category-flow": "categories",
  "/payment-method": "payments",
  "/friends": "friends",
  "/reports": "reports",
  "/settings": "settings",
  "/bill": "bills",
  "/groups": "groups",
  "/calendar-view": "calendar",
};

const CASHFLOW_VIEW_STATE_PREFIX = "cashflow:view-state:";
const CATEGORY_FLOW_VIEW_STATE_PREFIX = "categoryflow:view-state:";
const PAYMENT_METHOD_FLOW_VIEW_STATE_PREFIX = "paymentmethodflow:view-state:";

const isCashflowRoute = (pathname = "") => pathname.includes("/expenses");
const isCategoryFlowRoute = (pathname = "") =>
  pathname.includes("/category-flow");
const isPaymentMethodFlowRoute = (pathname = "") =>
  pathname.includes("/payment-method");

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
const clearCachedPaymentMethodFlowViewState = () =>
  clearCachedViewStateByPrefix(PAYMENT_METHOD_FLOW_VIEW_STATE_PREFIX);

const MenuItem = ({ name, path, icon, onClick, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colors, getIconFilter } = useTheme();

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
      const leavingPaymentMethodFlow =
        isPaymentMethodFlowRoute(location.pathname) &&
        !isPaymentMethodFlowRoute(path);
      if (leavingPaymentMethodFlow) {
        clearCachedPaymentMethodFlowViewState();
      }
      // Always pass fromSidebar state so target pages know origin
      navigate(path, { state: { fromSidebar: true } });
    }
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Check if icon is a React component or a string (image URL)
  const isReactComponent = typeof icon === "function" || (icon && icon.type);

  // Get shortcut attribute for Alt-key overlay
  const shortcutAttr = path ? PATH_TO_SHORTCUT_ATTR[path] : null;

  // Generate ID for Tour Guide targeting
  const tourId = path ? `nav-item-${path.replace(/^\//, "").replace(/\//g, "-")}` : undefined;

  return (
    <div
      id={tourId}
      onClick={handleClick}
      data-shortcut={shortcutAttr}
      className={`flex items-center justify-start w-full max-w-[360px] h-[52px] cursor-pointer rounded-lg overflow-hidden transition-all duration-200 pl-6`}
      style={{
        backgroundColor: isActive ? colors.active_bg : "transparent",
        color: isActive ? colors.active_text : colors.primary_text,
      }}
    >
      <span className="flex items-center flex-row-reverse px-3 w-full">
        <div className="flex-grow text-left font-bold text-[16px] leading-[20px] whitespace-nowrap flex items-center justify-between">
          <span>{name}</span>
          {/* Show keyboard shortcut hint if available */}
          {path && PATH_TO_SHORTCUT[path] && (
            <ShortcutBadge
              actionId={PATH_TO_SHORTCUT[path]}
              size="small"
              showOnHover={true}
            />
          )}
        </div>

        {icon && (
          <>
            {isReactComponent ? (
              // Render React icon component
              <span
                className="mr-3"
                style={{
                  color: isActive
                    ? colors.active_text
                    : colors.primary_text,
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
                  filter: getIconFilter(isActive),
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
