import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../../../Redux/Theme/theme.actions";
import { updateUserSettings } from "../../../../Redux/UserSettings/userSettings.action";

/**
 * Custom hook for handling settings actions
 * Follows Single Responsibility Principle - handles only action logic
 * Provides a clean interface for all settings actions
 */
export const useSettingsActions = (
  navigate,
  showSnackbar,
  setDeleteDialogOpen,
  setPasswordDialogOpen,
  isDark
) => {
  const dispatch = useDispatch();

  // Theme toggle action
  const handleThemeToggle = useCallback(async () => {
    dispatch(toggleTheme());
    const newMode = isDark ? "light" : "dark";
    try {
      await dispatch(updateUserSettings({ themeMode: newMode }));
      showSnackbar(`Theme changed to ${newMode} mode`, "success");
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  }, [dispatch, isDark, showSnackbar]);

  // Action handlers mapped to action IDs
  const actionHandlers = {
    editProfile: () => navigate("/profile"),
    changePassword: () => setPasswordDialogOpen(true),
    exportData: () => showSnackbar("Data export initiated", "success"),
    deleteAccount: () => setDeleteDialogOpen(true),
    enable2FA: () => showSnackbar("2FA setup coming soon", "info"),
    manageBlockedUsers: () => showSnackbar("Blocked users management", "info"),
    helpCenter: () => showSnackbar("Help center", "info"),
    contactSupport: () => showSnackbar("Contact support", "info"),
    termsOfService: () => showSnackbar("Terms of service", "info"),
    privacyPolicy: () => showSnackbar("Privacy policy", "info"),
  };

  // Generic action executor
  const executeAction = useCallback(
    (actionId) => {
      const handler = actionHandlers[actionId];
      if (handler) {
        handler();
      } else {
        console.warn(`No handler found for action: ${actionId}`);
      }
    },
    [actionHandlers]
  );

  return {
    handleThemeToggle,
    executeAction,
  };
};
