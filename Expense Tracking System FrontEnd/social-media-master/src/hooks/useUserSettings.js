import { useSelector } from "react-redux";

/**
 * Custom Hook: useUserSettings
 *
 * Provides centralized access to user settings from Redux store
 * with default fallback values and helper methods.
 *
 * @returns {Object} User settings object with all preference values
 *
 * @example
 * const settings = useUserSettings();
 * console.log(settings.language); // "en"
 * console.log(settings.currency); // "USD"
 * if (settings.emailNotifications) { ... }
 */
const useUserSettings = () => {
  const { settings, loading, error } = useSelector(
    (state) => state.userSettings || {},
  );

  // Default values if settings not loaded
  const defaultSettings = {
    themeMode: "dark",
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReports: false,
    pushNotifications: true,
    friendRequestNotifications: true,
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    profileVisibility: "public",
    twoFactorEnabled: false,
  };

  // Merge loaded settings with defaults
  const userSettings = settings
    ? { ...defaultSettings, ...settings }
    : defaultSettings;

  return {
    // Settings values
    ...userSettings,

    // Utility properties
    isLoading: loading,
    hasError: !!error,
    errorMessage: error,
    isLoaded: !!settings,

    // Notification settings group
    notifications: {
      email: userSettings.emailNotifications,
      budget: userSettings.budgetAlerts,
      weekly: userSettings.weeklyReports,
      push: userSettings.pushNotifications,
      friendRequests: userSettings.friendRequestNotifications,
    },

    // Preference settings group
    preferences: {
      language: userSettings.language,
      currency: userSettings.currency,
      dateFormat: userSettings.dateFormat,
      theme: userSettings.themeMode,
    },

    // Security settings group
    security: {
      profileVisibility: userSettings.profileVisibility,
      twoFactorEnabled: userSettings.twoFactorEnabled,
    },

    // Helper methods
    getCurrency: () => {
      const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        INR: "₹",
        JPY: "¥",
      };
      return {
        code: userSettings.currency,
        symbol: currencySymbols[userSettings.currency] || "₹",
      };
    },

    getLanguageName: () => {
      const languageNames = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        hi: "Hindi",
      };
      return languageNames[userSettings.language] || "English";
    },

    isDarkMode: () => userSettings.themeMode === "dark",
    isLightMode: () => userSettings.themeMode === "light",

    hasNotificationsEnabled: () =>
      userSettings.emailNotifications ||
      userSettings.pushNotifications ||
      userSettings.budgetAlerts,

    getDateFormatExample: () => {
      const examples = {
        "MM/DD/YYYY": "12/31/2024",
        "DD/MM/YYYY": "31/12/2024",
        "YYYY-MM-DD": "2024-12-31",
      };
      return examples[userSettings.dateFormat] || "31/12/2024";
    },
  };
};

export default useUserSettings;
