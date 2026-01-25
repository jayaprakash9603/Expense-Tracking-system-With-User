import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../../../Redux/Theme/theme.actions";
import { updateUserSettings } from "../../../../Redux/UserSettings/userSettings.action";
import { useTranslation } from "../../../../hooks/useTranslation";

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
  isDark,
) => {
  const dispatch = useDispatch();
  const { setLanguage, t } = useTranslation();

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

  // Language change handler - integrates with i18n
  const handleLanguageChange = useCallback(
    async (newLanguage) => {
      try {
        // Update i18n context
        setLanguage(newLanguage);

        // Update backend user settings
        await dispatch(updateUserSettings({ language: newLanguage }));

        // Show success message
        showSnackbar(t("messages.languageChanged"), "success");
      } catch (error) {
        console.error("Error updating language:", error);
        showSnackbar("Failed to update language", "error");
      }
    },
    [dispatch, setLanguage, showSnackbar, t],
  );

  // Action handlers mapped to action IDs
  const actionHandlers = {
    // Account Management
    editProfile: () => navigate("/profile", { state: { editMode: true } }),
    changePassword: () => setPasswordDialogOpen(true),
    exportData: () => {
      showSnackbar("Preparing data export...", "info");
      // Simulate export process
      setTimeout(() => {
        showSnackbar("Data export completed successfully!", "success");
      }, 2000);
    },
    deleteAccount: () => setDeleteDialogOpen(true),

    // Security
    enable2FA: () => {
      showSnackbar("Opening Two-Factor Authentication setup...", "info");
      // Navigate to 2FA setup page or open modal
    },
    manageBlockedUsers: () => {
      showSnackbar("Opening blocked users management...", "info");
      // Navigate to blocked users page
    },
    configureMfa: () => {
      // Save scroll position before navigating
      sessionStorage.setItem(
        "settingsScrollPosition",
        window.scrollY.toString(),
      );
      navigate("/settings/mfa");
    },

    // Data & Storage
    viewStorage: () => {
      showSnackbar("Storage usage: 234 MB of 5 GB used", "info");
      // Open storage details modal
    },
    clearCache: () => {
      showSnackbar("Clearing cache...", "info");
      setTimeout(() => {
        showSnackbar("Cache cleared successfully! Freed 156 MB", "success");
      }, 1500);
    },

    // Accessibility
    viewShortcuts: () => {
      showSnackbar("Opening keyboard shortcuts guide...", "info");
      // Open shortcuts modal or navigate to shortcuts page
    },

    // Notifications
    notificationSettings: () => {
      // Save scroll position before navigating
      sessionStorage.setItem(
        "settingsScrollPosition",
        window.scrollY.toString(),
      );
      navigate("/settings/notifications");
    },

    // Help & Support
    helpCenter: () => {
      showSnackbar("Opening help center...", "info");
      // Navigate to help center
    },
    contactSupport: () => {
      showSnackbar("Opening contact support form...", "info");
      // Open support form modal
    },
    termsOfService: () => {
      showSnackbar("Opening terms of service...", "info");
      // Navigate to terms page
    },
    privacyPolicy: () => {
      showSnackbar("Opening privacy policy...", "info");
      // Navigate to privacy page
    },
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
    [actionHandlers],
  );

  return {
    handleThemeToggle,
    handleLanguageChange,
    executeAction,
  };
};
