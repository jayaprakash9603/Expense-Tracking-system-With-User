import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateUserSettings } from "../../../../Redux/UserSettings/userSettings.action";
import {
  getDefaultNotificationPreferences,
  NOTIFICATION_SERVICES,
} from "../constants/notificationConfig";

/**
 * Custom hook for managing notification settings
 * Follows Single Responsibility Principle - handles only notification preferences
 * Implements DRY principle - centralized notification settings logic
 */
export const useNotificationSettings = (userSettings, showSnackbar) => {
  const dispatch = useDispatch();

  // Initialize with default preferences
  const [notificationPreferences, setNotificationPreferences] = useState(
    getDefaultNotificationPreferences()
  );

  // Sync with Redux store when settings are loaded
  useEffect(() => {
    if (userSettings?.notificationPreferences) {
      setNotificationPreferences(userSettings.notificationPreferences);
    }
  }, [userSettings]);

  /**
   * Update master notification toggle
   */
  const updateMasterToggle = useCallback(
    async (enabled) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          masterEnabled: enabled,
        };
        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );
        showSnackbar(
          enabled ? "All notifications enabled" : "All notifications disabled",
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update notification settings", "error");
        console.error("Error updating master toggle:", error);
        // Revert on error
        setNotificationPreferences((prev) => ({
          ...prev,
          masterEnabled: !enabled,
        }));
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update global notification setting (DND, Sound, Browser)
   */
  const updateGlobalSetting = useCallback(
    async (settingKey, value) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          [settingKey]: value,
        };
        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        const messages = {
          doNotDisturb: value
            ? "Do Not Disturb mode enabled"
            : "Do Not Disturb mode disabled",
          notificationSound: value
            ? "Notification sounds enabled"
            : "Notification sounds disabled",
          browserNotifications: value
            ? "Browser notifications enabled"
            : "Browser notifications disabled",
        };

        showSnackbar(messages[settingKey] || "Setting updated", "success");
      } catch (error) {
        showSnackbar("Failed to update setting", "error");
        console.error("Error updating global setting:", error);
        // Revert on error
        setNotificationPreferences((prev) => ({
          ...prev,
          [settingKey]: !value,
        }));
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update service-level notification toggle
   */
  const updateServiceToggle = useCallback(
    async (serviceId, enabled) => {
      try {
        const serviceName =
          NOTIFICATION_SERVICES[
            Object.keys(NOTIFICATION_SERVICES).find(
              (key) => NOTIFICATION_SERVICES[key].id === serviceId
            )
          ]?.name || "Service";

        const updatedPreferences = {
          ...notificationPreferences,
          services: {
            ...notificationPreferences.services,
            [serviceId]: {
              ...notificationPreferences.services[serviceId],
              enabled,
            },
          },
        };

        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        showSnackbar(
          `${serviceName} notifications ${enabled ? "enabled" : "disabled"}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update service notifications", "error");
        console.error("Error updating service toggle:", error);
        // Revert on error
        setNotificationPreferences((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            [serviceId]: {
              ...prev.services[serviceId],
              enabled: !enabled,
            },
          },
        }));
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update individual notification toggle
   */
  const updateNotificationToggle = useCallback(
    async (serviceId, notificationId, enabled) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          services: {
            ...notificationPreferences.services,
            [serviceId]: {
              ...notificationPreferences.services[serviceId],
              notifications: {
                ...notificationPreferences.services[serviceId].notifications,
                [notificationId]: {
                  ...notificationPreferences.services[serviceId].notifications[
                    notificationId
                  ],
                  enabled,
                },
              },
            },
          },
        };

        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        showSnackbar(
          `Notification ${enabled ? "enabled" : "disabled"}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update notification", "error");
        console.error("Error updating notification toggle:", error);
        // Revert on error
        setNotificationPreferences((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            [serviceId]: {
              ...prev.services[serviceId],
              notifications: {
                ...prev.services[serviceId].notifications,
                [notificationId]: {
                  ...prev.services[serviceId].notifications[notificationId],
                  enabled: !enabled,
                },
              },
            },
          },
        }));
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update notification frequency
   */
  const updateNotificationFrequency = useCallback(
    async (serviceId, notificationId, frequency) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          services: {
            ...notificationPreferences.services,
            [serviceId]: {
              ...notificationPreferences.services[serviceId],
              notifications: {
                ...notificationPreferences.services[serviceId].notifications,
                [notificationId]: {
                  ...notificationPreferences.services[serviceId].notifications[
                    notificationId
                  ],
                  frequency,
                },
              },
            },
          },
        };

        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        showSnackbar(
          `Notification frequency updated to ${frequency}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update frequency", "error");
        console.error("Error updating frequency:", error);
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update notification delivery method
   */
  const updateNotificationMethod = useCallback(
    async (serviceId, notificationId, method, enabled) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          services: {
            ...notificationPreferences.services,
            [serviceId]: {
              ...notificationPreferences.services[serviceId],
              notifications: {
                ...notificationPreferences.services[serviceId].notifications,
                [notificationId]: {
                  ...notificationPreferences.services[serviceId].notifications[
                    notificationId
                  ],
                  methods: {
                    ...notificationPreferences.services[serviceId]
                      .notifications[notificationId].methods,
                    [method]: enabled,
                  },
                },
              },
            },
          },
        };

        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        showSnackbar(
          `${method.toUpperCase()} notifications ${
            enabled ? "enabled" : "disabled"
          }`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update delivery method", "error");
        console.error("Error updating notification method:", error);
        // Revert on error
        setNotificationPreferences((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            [serviceId]: {
              ...prev.services[serviceId],
              notifications: {
                ...prev.services[serviceId].notifications,
                [notificationId]: {
                  ...prev.services[serviceId].notifications[notificationId],
                  methods: {
                    ...prev.services[serviceId].notifications[notificationId]
                      .methods,
                    [method]: !enabled,
                  },
                },
              },
            },
          },
        }));
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Update quiet hours settings
   */
  const updateQuietHours = useCallback(
    async (quietHoursSettings) => {
      try {
        const updatedPreferences = {
          ...notificationPreferences,
          quietHours: {
            ...notificationPreferences.quietHours,
            ...quietHoursSettings,
          },
        };

        setNotificationPreferences(updatedPreferences);
        await dispatch(
          updateUserSettings({ notificationPreferences: updatedPreferences })
        );

        showSnackbar("Quiet hours updated", "success");
      } catch (error) {
        showSnackbar("Failed to update quiet hours", "error");
        console.error("Error updating quiet hours:", error);
      }
    },
    [notificationPreferences, dispatch, showSnackbar]
  );

  /**
   * Reset all notification settings to default
   */
  const resetToDefaults = useCallback(async () => {
    try {
      const defaultPreferences = getDefaultNotificationPreferences();
      setNotificationPreferences(defaultPreferences);
      await dispatch(
        updateUserSettings({ notificationPreferences: defaultPreferences })
      );
      showSnackbar("Notification settings reset to defaults", "success");
    } catch (error) {
      showSnackbar("Failed to reset settings", "error");
      console.error("Error resetting notification settings:", error);
    }
  }, [dispatch, showSnackbar]);

  return {
    notificationPreferences,
    updateMasterToggle,
    updateGlobalSetting,
    updateServiceToggle,
    updateNotificationToggle,
    updateNotificationFrequency,
    updateNotificationMethod,
    updateQuietHours,
    resetToDefaults,
  };
};
