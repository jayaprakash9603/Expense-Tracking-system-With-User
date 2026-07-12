import { useSelector } from "react-redux";
import dayjs from "dayjs";

const DEFAULT_SETTINGS = {
  themeMode: "dark",
  language: "en",
  currency: "INR",
  currencySymbol: "₹",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  profileVisibility: "private",
  maskSensitiveData: false,
  twoFactorEnabled: false,
  mfaEnabled: false,
  autoLogout: false,
  autoBackup: false,
  backupFrequency: "weekly",
  cloudSync: false,
  autoCategorize: true,
  smartBudgeting: false,
  scheduledReports: "none",
  expenseReminders: true,
  predictiveAnalytics: false,
  screenReaderSupport: false,
  keyboardShortcuts: true,
  showShortcutIndicators: false,
  reduceMotion: false,
  enhancedFocusIndicators: false,
  fontSize: "medium",
  compactMode: false,
  enableAnimations: true,
  highContrastMode: false,
};

export function useUserSettings() {
  const { settings, loading, error } = useSelector((state) => state.userSettings);
  const merged = { ...DEFAULT_SETTINGS, ...settings };

  const getCurrency = () => merged.currency;
  const getCurrencySymbol = () => merged.currencySymbol;
  const isDarkMode = () => merged.themeMode === "dark";
  const getDateFormat = () => merged.dateFormat;
  const getTimeFormat = () => merged.timeFormat;
  const getFontSize = () => merged.fontSize;

  const getDateFormatExample = () => dayjs().format(merged.dateFormat);

  const notifications = {
    expenseReminders: merged.expenseReminders,
    scheduledReports: merged.scheduledReports,
  };

  const preferences = {
    language: merged.language,
    currency: merged.currency,
    currencySymbol: merged.currencySymbol,
    dateFormat: merged.dateFormat,
    timeFormat: merged.timeFormat,
    fontSize: merged.fontSize,
    compactMode: merged.compactMode,
    enableAnimations: merged.enableAnimations,
    highContrastMode: merged.highContrastMode,
    reduceMotion: merged.reduceMotion,
  };

  const security = {
    twoFactorEnabled: merged.twoFactorEnabled,
    mfaEnabled: merged.mfaEnabled,
    autoLogout: merged.autoLogout,
    maskSensitiveData: merged.maskSensitiveData,
    profileVisibility: merged.profileVisibility,
  };

  return {
    settings: merged,
    loading,
    error,
    getCurrency,
    getCurrencySymbol,
    isDarkMode,
    getDateFormat,
    getTimeFormat,
    getFontSize,
    getDateFormatExample,
    notifications,
    preferences,
    security,
  };
}

export default useUserSettings;
