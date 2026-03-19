import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings } from "@/redux/userSettings/userSettings.actions";
import { UPDATE_USER_SETTINGS_SUCCESS } from "@/redux/userSettings/userSettings.actionTypes";
import { toast } from "sonner";

const SETTINGS_STORAGE_KEY = "expensio_user_settings";

const DEFAULT_LOCAL_SETTINGS = {
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
  fontFamily: "inter",
  fontSize: "medium",
  compactMode: false,
  enableAnimations: true,
  highContrastMode: false,
};

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore parse errors */
  }
  return null;
}

function saveToStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore storage errors */
  }
}

export function useSettingsState() {
  const dispatch = useDispatch();
  const reduxSettings = useSelector((state) => state.userSettings?.settings);
  const initRef = useRef(false);

  const [localSettings, setLocalSettings] = useState(() => {
    const stored = loadFromStorage();
    return { ...DEFAULT_LOCAL_SETTINGS, ...stored };
  });

  useEffect(() => {
    if (reduxSettings && !initRef.current) {
      initRef.current = true;
      const merged = { ...DEFAULT_LOCAL_SETTINGS, ...reduxSettings };
      setLocalSettings(merged);
      saveToStorage(merged);
    } else if (reduxSettings) {
      setLocalSettings((prev) => {
        const merged = { ...prev, ...reduxSettings };
        saveToStorage(merged);
        return merged;
      });
    }
  }, [reduxSettings]);

  const syncToRedux = useCallback(
    (newSettings) => {
      dispatch({
        type: UPDATE_USER_SETTINGS_SUCCESS,
        payload: newSettings,
      });
    },
    [dispatch]
  );

  const updateSetting = useCallback(
    async (key, value, successMessage) => {
      const previousValue = localSettings[key];
      const newSettings = { ...localSettings, [key]: value };

      setLocalSettings(newSettings);
      saveToStorage(newSettings);
      syncToRedux(newSettings);

      const previousSettingsData = { [key]: previousValue };
      const result = await dispatch(
        updateUserSettings({ [key]: value }, previousSettingsData)
      );

      if (result?.message) {
        const rolledBack = { ...newSettings, [key]: previousValue };
        setLocalSettings(rolledBack);
        saveToStorage(rolledBack);
        syncToRedux(rolledBack);
        toast.error(result.message);
        return false;
      }

      if (successMessage) {
        toast.success(successMessage);
      }
      return true;
    },
    [dispatch, localSettings, syncToRedux]
  );

  return { settings: localSettings, updateSetting };
}

export default useSettingsState;
