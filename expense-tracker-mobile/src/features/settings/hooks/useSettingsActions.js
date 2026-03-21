import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { logoutAction } from "@/redux/auth/auth.actions";
import { clearUserSettings } from "@/redux/userSettings/userSettings.actions";
import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import { toast } from "sonner";

export function useSettingsActions(updateSetting) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setMode } = useTheme();
  const { setLanguage, t } = useLanguage();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleThemeToggle = useCallback(
    (value) => {
      const newMode = value === "dark" ? "dark" : "light";
      setMode(newMode);
      updateSetting("themeMode", newMode);
    },
    [setMode, updateSetting]
  );

  const handleLanguageChange = useCallback(
    (value) => {
      setLanguage(value);
      updateSetting("language", value);
    },
    [setLanguage, updateSetting]
  );

  const executeAction = useCallback(
    (actionId) => {
      const actions = {
        editProfile: () => navigate("/profile"),

        changePassword: () => setChangePasswordOpen(true),

        deleteAccount: () => setDeleteAccountOpen(true),

        dataExport: async () => {
          toast.info(t("settings.actions.preparingExport"));
          const { data, error } = await safeApiCall(() =>
            api.get("/api/user/export", { responseType: "blob" })
          );
          if (error) {
            toast.error(t("settings.actions.exportFailed"));
            return;
          }
          const url = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `expensio-export-${Date.now()}.json`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          toast.success(t("settings.actions.exportSuccess"));
        },

        configureMfa: () => navigate("/settings/mfa"),

        blockedUsers: () => navigate("/settings/blocked-users"),

        viewStorage: () => {
          if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(({ usage, quota }) => {
              const usedMB = (usage / (1024 * 1024)).toFixed(2);
              const totalMB = (quota / (1024 * 1024)).toFixed(0);
              toast.info(
                t("settings.actions.storageUsage", { used: usedMB, total: totalMB }),
              );
            });
          } else {
            toast.info(t("settings.actions.storageUnavailable"));
          }
        },

        clearCache: () => {
          localStorage.removeItem("expensio_user_settings");
          if ("caches" in window) {
            caches.keys().then((names) => {
              names.forEach((name) => caches.delete(name));
            });
          }
          toast.success(t("settings.actions.cacheCleared"));
        },

        shortcutsGuide: () => {
          toast.info(t("settings.actions.shortcutsGuide"));
        },

        notificationSettings: () => navigate("/settings/notifications"),

        restartTour: () => {
          localStorage.removeItem("tour_completed");
          toast.success(t("settings.actions.tourRestart"));
          setTimeout(() => navigate("/dashboard"), 500);
        },

        helpCenter: () => window.open("https://help.expensio.app", "_blank"),

        contactSupport: () => window.open("mailto:support@expensio.app", "_blank"),

        termsOfService: () => window.open("https://expensio.app/terms", "_blank"),

        privacyPolicy: () => window.open("https://expensio.app/privacy", "_blank"),

        logout: () => {
          dispatch(logoutAction());
          dispatch(clearUserSettings());
          localStorage.removeItem("expensio_user_settings");
          navigate("/login");
        },
      };

      const action = actions[actionId];
      if (action) action();
    },
    [navigate, dispatch, t]
  );

  return {
    handleThemeToggle,
    handleLanguageChange,
    executeAction,
    changePasswordOpen,
    setChangePasswordOpen,
    deleteAccountOpen,
    setDeleteAccountOpen,
  };
}

export default useSettingsActions;
