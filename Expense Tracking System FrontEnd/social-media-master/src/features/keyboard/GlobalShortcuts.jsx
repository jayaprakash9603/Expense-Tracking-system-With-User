/**
 * GlobalShortcuts - Registers application-wide keyboard shortcuts
 * 
 * This component mounts once in the app and registers all global shortcuts
 * like navigation, theme toggle, search, etc. It uses the navigation
 * functions and Redux dispatch to perform actions.
 */

import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useKeyboardShortcuts } from "./KeyboardShortcutProvider";
import { DEFAULT_SHORTCUTS } from "./shortcutDefinitions";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { useMasking } from "../../hooks/useMasking";

/**
 * Component that registers all global shortcuts
 * Place this in your main layout component
 */
export function GlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const { toggleMasking } = useMasking();
  
  // User role for admin shortcuts
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === "ADMIN";

  // Navigation shortcuts - routes match AppRoutes.js
  const navigationActions = useCallback(() => ({
    GO_DASHBOARD: () => navigate("/dashboard"),
    GO_EXPENSES: () => navigate("/expenses"),
    GO_BUDGETS: () => navigate("/budget"),
    GO_BILLS: () => navigate("/bill"),
    GO_CATEGORIES: () => navigate("/category-flow"),
    GO_PAYMENTS: () => navigate("/payment-method"),
    GO_FRIENDS: () => navigate("/friends"),
    GO_REPORTS: () => navigate("/reports"),
    GO_CALENDAR: () => navigate("/calendar-view"),
    GO_SETTINGS: () => navigate("/settings"),
    GO_PROFILE: () => navigate("/profile"),
    GO_ADMIN: () => isAdmin && navigate("/admin/dashboard"),
  }), [navigate, isAdmin]);

  // Creation shortcuts - routes match AppRoutes.js
  const creationActions = useCallback(() => ({
    NEW_EXPENSE: () => navigate("/expenses/create"),
    NEW_BUDGET: () => navigate("/budget/create"),
    NEW_BILL: () => navigate("/bill/create"),
    NEW_CATEGORY: () => navigate("/category-flow/create"),
    NEW_PAYMENT_METHOD: () => navigate("/payment-method/create"),
  }), [navigate]);

  // General action shortcuts
  const generalActions = useCallback(() => ({
    TOGGLE_THEME: () => dispatch(toggleTheme()),
    TOGGLE_MASKING: () => toggleMasking(),
    REFRESH_DATA: () => {
      // Dispatch a refresh event that components can listen to
      window.dispatchEvent(new CustomEvent("app:refresh"));
    },
  }), [dispatch, toggleMasking]);

  // Register all shortcuts on mount
  useEffect(() => {
    const navActions = navigationActions();
    const createActions = creationActions();
    const genActions = generalActions();

    const allActions = {
      ...navActions,
      ...createActions,
      ...genActions,
    };

    const registeredIds = [];

    // Register each shortcut
    Object.entries(allActions).forEach(([actionId, action]) => {
      const shortcutDef = DEFAULT_SHORTCUTS[actionId];
      if (!shortcutDef) return;

      // Skip admin shortcuts for non-admin users
      if (shortcutDef.requiresRole === "ADMIN" && !isAdmin) return;

      const result = registerShortcut({
        ...shortcutDef,
        action,
      });

      if (result.success) {
        registeredIds.push(actionId);
      }
    });

    // Cleanup on unmount
    return () => {
      registeredIds.forEach((id) => unregisterShortcut(id));
    };
  }, [
    registerShortcut,
    unregisterShortcut,
    navigationActions,
    creationActions,
    generalActions,
    isAdmin,
  ]);

  // This component doesn't render anything
  return null;
}

export default GlobalShortcuts;
