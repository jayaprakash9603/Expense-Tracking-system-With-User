/**
 * UserSettingsHelper Class
 *
 * Utility class for working with user settings data.
 * Provides static methods for formatting, validation, and conversion.
 *
 * @example
 * const currencySymbol = UserSettingsHelper.getCurrencySymbol("USD"); // "$"
 * const formatted = UserSettingsHelper.formatCurrency(1234.56, "USD"); // "$1,234.56"
 */
class UserSettingsHelper {
  // Currency configurations
  static CURRENCY_CONFIG = {
    USD: { symbol: "$", name: "US Dollar", code: "USD" },
    EUR: { symbol: "€", name: "Euro", code: "EUR" },
    GBP: { symbol: "£", name: "British Pound", code: "GBP" },
    INR: { symbol: "₹", name: "Indian Rupee", code: "INR" },
    JPY: { symbol: "¥", name: "Japanese Yen", code: "JPY" },
  };

  // Language configurations
  static LANGUAGE_CONFIG = {
    en: { name: "English", nativeName: "English", code: "en" },
    es: { name: "Spanish", nativeName: "Español", code: "es" },
    fr: { name: "French", nativeName: "Français", code: "fr" },
    de: { name: "German", nativeName: "Deutsch", code: "de" },
    hi: { name: "Hindi", nativeName: "हिन्दी", code: "hi" },
  };

  // Date format configurations
  static DATE_FORMAT_CONFIG = {
    "MM/DD/YYYY": { example: "12/31/2024", format: "MM/DD/YYYY" },
    "DD/MM/YYYY": { example: "31/12/2024", format: "DD/MM/YYYY" },
    "YYYY-MM-DD": { example: "2024-12-31", format: "YYYY-MM-DD" },
  };

  // Default settings
  static DEFAULT_SETTINGS = {
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

  /**
   * Get currency symbol for a currency code
   * @param {string} currencyCode - Currency code (USD, EUR, etc.)
   * @returns {string} Currency symbol
   */
  static getCurrencySymbol(currencyCode) {
    return this.CURRENCY_CONFIG[currencyCode]?.symbol || "₹";
  }

  /**
   * Get currency name
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency name
   */
  static getCurrencyName(currencyCode) {
    return this.CURRENCY_CONFIG[currencyCode]?.name || "Indian Rupee";
  }

  /**
   * Format amount with currency
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount, currencyCode = "INR") {
    const symbol = this.getCurrencySymbol(currencyCode);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol}${formatted}`;
  }

  /**
   * Get language display name
   * @param {string} languageCode - Language code (en, es, etc.)
   * @returns {string} Language name
   */
  static getLanguageName(languageCode) {
    return this.LANGUAGE_CONFIG[languageCode]?.name || "English";
  }

  /**
   * Get language native name
   * @param {string} languageCode - Language code
   * @returns {string} Native language name
   */
  static getLanguageNativeName(languageCode) {
    return this.LANGUAGE_CONFIG[languageCode]?.nativeName || "English";
  }

  /**
   * Format date according to user's date format preference
   * @param {Date|string} date - Date to format
   * @param {string} dateFormat - User's preferred date format
   * @returns {string} Formatted date string
   */
  static formatDate(date, dateFormat = "DD/MM/YYYY") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    switch (dateFormat) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM/DD/YYYY":
      default:
        return `${month}/${day}/${year}`;
    }
  }

  /**
   * Get date format example
   * @param {string} dateFormat - Date format string
   * @returns {string} Example date
   */
  static getDateFormatExample(dateFormat) {
    return this.DATE_FORMAT_CONFIG[dateFormat]?.example || "31/12/2024";
  }

  /**
   * Validate settings object
   * @param {Object} settings - Settings object to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validateSettings(settings) {
    const errors = [];

    // Validate theme mode
    if (settings.themeMode && !["light", "dark"].includes(settings.themeMode)) {
      errors.push("Invalid theme mode. Must be 'light' or 'dark'.");
    }

    // Validate currency
    if (settings.currency && !this.CURRENCY_CONFIG[settings.currency]) {
      errors.push("Invalid currency code.");
    }

    // Validate language
    if (settings.language && !this.LANGUAGE_CONFIG[settings.language]) {
      errors.push("Invalid language code.");
    }

    // Validate date format
    if (settings.dateFormat && !this.DATE_FORMAT_CONFIG[settings.dateFormat]) {
      errors.push("Invalid date format.");
    }

    // Validate boolean fields
    const booleanFields = [
      "emailNotifications",
      "budgetAlerts",
      "weeklyReports",
      "pushNotifications",
      "friendRequestNotifications",
      "twoFactorEnabled",
    ];

    booleanFields.forEach((field) => {
      if (
        settings[field] !== undefined &&
        typeof settings[field] !== "boolean"
      ) {
        errors.push(`${field} must be a boolean value.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge settings with defaults
   * @param {Object} settings - User settings
   * @returns {Object} Merged settings with defaults
   */
  static mergeWithDefaults(settings) {
    return {
      ...this.DEFAULT_SETTINGS,
      ...settings,
    };
  }

  /**
   * Get all available currencies
   * @returns {Array} Array of currency objects
   */
  static getAllCurrencies() {
    return Object.entries(this.CURRENCY_CONFIG).map(([code, config]) => ({
      code,
      ...config,
    }));
  }

  /**
   * Get all available languages
   * @returns {Array} Array of language objects
   */
  static getAllLanguages() {
    return Object.entries(this.LANGUAGE_CONFIG).map(([code, config]) => ({
      code,
      ...config,
    }));
  }

  /**
   * Get all available date formats
   * @returns {Array} Array of date format objects
   */
  static getAllDateFormats() {
    return Object.entries(this.DATE_FORMAT_CONFIG).map(([format, config]) => ({
      format,
      ...config,
    }));
  }

  /**
   * Check if notifications are enabled
   * @param {Object} settings - User settings
   * @returns {boolean} True if any notification is enabled
   */
  static hasNotificationsEnabled(settings) {
    return (
      settings.emailNotifications ||
      settings.pushNotifications ||
      settings.budgetAlerts ||
      settings.weeklyReports ||
      settings.friendRequestNotifications
    );
  }

  /**
   * Get notification summary
   * @param {Object} settings - User settings
   * @returns {Object} Notification settings summary
   */
  static getNotificationSummary(settings) {
    return {
      total: 5,
      enabled: [
        settings.emailNotifications,
        settings.budgetAlerts,
        settings.weeklyReports,
        settings.pushNotifications,
        settings.friendRequestNotifications,
      ].filter(Boolean).length,
      details: {
        email: settings.emailNotifications,
        budget: settings.budgetAlerts,
        weekly: settings.weeklyReports,
        push: settings.pushNotifications,
        friendRequests: settings.friendRequestNotifications,
      },
    };
  }

  /**
   * Convert settings to API request format
   * @param {Object} settings - Settings object
   * @returns {Object} API-ready settings object
   */
  static toApiFormat(settings) {
    return {
      themeMode: settings.themeMode || settings.theme,
      emailNotifications: settings.emailNotifications,
      budgetAlerts: settings.budgetAlerts,
      weeklyReports: settings.weeklyReports,
      pushNotifications: settings.pushNotifications,
      friendRequestNotifications: settings.friendRequestNotifications,
      language: settings.language,
      currency: settings.currency,
      dateFormat: settings.dateFormat,
      profileVisibility: settings.profileVisibility,
      twoFactorEnabled: settings.twoFactorEnabled,
    };
  }

  /**
   * Compare two settings objects
   * @param {Object} settings1 - First settings object
   * @param {Object} settings2 - Second settings object
   * @returns {Object} Object with changed fields
   */
  static getChangedFields(settings1, settings2) {
    const changes = {};
    const allKeys = new Set([
      ...Object.keys(settings1),
      ...Object.keys(settings2),
    ]);

    allKeys.forEach((key) => {
      if (settings1[key] !== settings2[key]) {
        changes[key] = {
          old: settings1[key],
          new: settings2[key],
        };
      }
    });

    return changes;
  }
}

export default UserSettingsHelper;
