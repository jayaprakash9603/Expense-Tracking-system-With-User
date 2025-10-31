import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateUserSettings } from "../../../../Redux/UserSettings/userSettings.action";

/**
 * Custom hook for managing settings state and updates
 * Follows Single Responsibility Principle - handles only settings state management
 * Implements DRY principle - centralized settings update logic
 */
export const useSettingsState = (userSettings, showSnackbar) => {
  const dispatch = useDispatch();

  // Local state for settings
  const [settingsState, setSettingsState] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReports: false,
    pushNotifications: true,
    friendRequests: true,
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    profileVisibility: "PUBLIC",
  });

  // Sync local state with Redux store when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setSettingsState({
        emailNotifications: userSettings.emailNotifications ?? true,
        budgetAlerts: userSettings.budgetAlerts ?? true,
        weeklyReports: userSettings.weeklyReports ?? false,
        pushNotifications: userSettings.pushNotifications ?? true,
        friendRequests: userSettings.friendRequestNotifications ?? true,
        language: userSettings.language ?? "en",
        currency: userSettings.currency ?? "INR",
        dateFormat: userSettings.dateFormat ?? "DD/MM/YYYY",
        profileVisibility: userSettings.profileVisibility ?? "PUBLIC",
      });
    }
  }, [userSettings]);

  // Generic update function for any setting
  const updateSetting = useCallback(
    async (key, value, successMessage) => {
      try {
        setSettingsState((prev) => ({ ...prev, [key]: value }));
        await dispatch(updateUserSettings({ [key]: value }));
        if (successMessage) {
          showSnackbar(successMessage, "success");
        }
      } catch (error) {
        showSnackbar("Failed to update settings", "error");
        console.error("Error updating settings:", error);
        // Revert state on error
        setSettingsState((prev) => ({ ...prev, [key]: !value }));
      }
    },
    [dispatch, showSnackbar]
  );

  return {
    settingsState,
    updateSetting,
  };
};
