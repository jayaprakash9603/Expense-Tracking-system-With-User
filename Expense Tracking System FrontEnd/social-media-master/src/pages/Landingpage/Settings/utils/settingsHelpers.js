/**
 * Utility functions for rendering different types of setting items
 * Follows DRY principle - reusable rendering logic
 * Separates concerns - pure functions for specific purposes
 */

import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { PROFILE_VISIBILITY_LABELS } from "../constants/settingsConfig";

/**
 * Get the appropriate icon for theme setting
 */
export const getThemeIcon = (isDark) => {
  return isDark ? DarkModeIcon : LightModeIcon;
};

/**
 * Get the theme description
 */
export const getThemeDescription = (isDark) => {
  return `Currently using ${isDark ? "dark" : "light"} mode`;
};

/**
 * Get chip color based on profile visibility
 */
export const getProfileVisibilityChipColor = (visibility) => {
  const colorMap = {
    PUBLIC: "rgba(34, 197, 94, 0.2)",
    FRIENDS: "rgba(59, 130, 246, 0.2)",
    PRIVATE: "rgba(239, 68, 68, 0.2)",
  };
  return colorMap[visibility] || "";
};

/**
 * Get text color based on profile visibility
 */
export const getProfileVisibilityTextColor = (visibility) => {
  const colorMap = {
    PUBLIC: "#22c55e",
    FRIENDS: "#3b82f6",
    PRIVATE: "#ef4444",
  };
  return colorMap[visibility] || "";
};

/**
 * Get profile visibility label
 */
export const getProfileVisibilityLabel = (visibility, t) => {
  const labelData = PROFILE_VISIBILITY_LABELS[visibility];
  if (!labelData) return "";
  return t
    ? labelData.labelKey
      ? t(labelData.labelKey)
      : labelData.label
    : labelData.label;
};

/**
 * Generate toggle message for boolean settings
 */
export const getToggleMessage = (settingName, isEnabled) => {
  return `${settingName} ${isEnabled ? "enabled" : "disabled"}`;
};
