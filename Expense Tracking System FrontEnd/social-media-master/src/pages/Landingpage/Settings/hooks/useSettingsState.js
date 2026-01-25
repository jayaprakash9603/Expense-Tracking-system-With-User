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
    // Notifications
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReports: false,
    pushNotifications: true,
    friendRequests: true,

    // Preferences
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",

    // Privacy & Security
    profileVisibility: "PUBLIC",
    sessionTimeout: true,
    maskSensitiveData: false,
    twoFactorEnabled: false,

    // Appearance
    fontSize: "medium",
    compactMode: false,
    animations: true,
    highContrast: false,

    // Data & Storage
    autoBackup: true,
    backupFrequency: "weekly",
    cloudSync: true,

    // Smart Features
    autoCategorize: true,
    smartBudgeting: true,
    scheduledReports: "weekly",
    expenseReminders: true,
    predictiveAnalytics: false,

    // Accessibility
    screenReader: false,
    keyboardShortcuts: true,
    reduceMotion: false,
    focusIndicators: false,
  });

  // Sync local state with Redux store when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setSettingsState({
        // Notifications
        emailNotifications: userSettings.emailNotifications ?? true,
        budgetAlerts: userSettings.budgetAlerts ?? true,
        weeklyReports: userSettings.weeklyReports ?? false,
        pushNotifications: userSettings.pushNotifications ?? true,
        friendRequests: userSettings.friendRequestNotifications ?? true,

        // Preferences
        language: userSettings.language ?? "en",
        currency: userSettings.currency ?? "INR",
        dateFormat: userSettings.dateFormat ?? "DD/MM/YYYY",
        timeFormat: userSettings.timeFormat ?? "12h",

        // Privacy & Security
        profileVisibility: userSettings.profileVisibility ?? "PUBLIC",
        sessionTimeout: userSettings.sessionTimeout ?? true,
        maskSensitiveData: userSettings.maskSensitiveData ?? false,
        twoFactorEnabled: userSettings.twoFactorEnabled ?? false,

        // Appearance
        fontSize: userSettings.fontSize ?? "medium",
        compactMode: userSettings.compactMode ?? false,
        animations: userSettings.animations ?? true,
        highContrast: userSettings.highContrast ?? false,

        // Data & Storage
        autoBackup: userSettings.autoBackup ?? true,
        backupFrequency: userSettings.backupFrequency ?? "weekly",
        cloudSync: userSettings.cloudSync ?? true,

        // Smart Features
        autoCategorize: userSettings.autoCategorize ?? true,
        smartBudgeting: userSettings.smartBudgeting ?? true,
        scheduledReports: userSettings.scheduledReports ?? "weekly",
        expenseReminders: userSettings.expenseReminders ?? true,
        predictiveAnalytics: userSettings.predictiveAnalytics ?? false,

        // Accessibility
        screenReader: userSettings.screenReader ?? false,
        keyboardShortcuts: userSettings.keyboardShortcuts ?? true,
        reduceMotion: userSettings.reduceMotion ?? false,
        focusIndicators: userSettings.focusIndicators ?? false,
      });
    }
  }, [userSettings]);

  // Generic update function for any setting
  const updateSetting = useCallback(
    async (key, value, successMessage) => {
      let previousValue;
      try {
        setSettingsState((prev) => {
          previousValue = prev[key];
          return { ...prev, [key]: value };
        });
        await dispatch(
          updateUserSettings({ [key]: value }, { [key]: previousValue }),
        );
        if (successMessage) {
          showSnackbar(successMessage, "success");
        }
      } catch (error) {
        showSnackbar("Failed to update settings", "error");
        console.error("Error updating settings:", error);
        // Revert state on error
        setSettingsState((prev) => ({ ...prev, [key]: previousValue }));
      }
    },
    [dispatch, showSnackbar],
  );

  return {
    settingsState,
    updateSetting,
  };
};
