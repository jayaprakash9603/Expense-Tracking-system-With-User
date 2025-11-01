import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationPreferences,
  updateNotificationPreference,
  resetNotificationPreferences,
} from "../../../../Redux/NotificationPreferences/notificationPreferences.action";
import {
  getDefaultNotificationPreferences,
  NOTIFICATION_SERVICES,
} from "../constants/notificationConfig";

/**
 * Custom hook for managing notification settings
 * Follows Single Responsibility Principle - handles only notification preferences
 * Implements DRY principle - centralized notification settings logic
 * Integrated with backend API via Redux
 */
export const useNotificationSettings = (showSnackbar, targetId = "") => {
  const dispatch = useDispatch();

  // Get preferences from Redux store
  const { preferences, loading, updating, error } = useSelector(
    (state) => state.notificationPreferences
  );

  // Local state for optimistic updates
  const [localPreferences, setLocalPreferences] = useState(null);

  // Fetch preferences on mount
  useEffect(() => {
    if (!preferences) {
      dispatch(fetchNotificationPreferences(targetId)).catch((err) => {
        showSnackbar("Failed to load notification preferences", "error");
      });
    }
  }, [dispatch, preferences, showSnackbar, targetId]);

  // Sync local state with Redux store
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  /**
   * Update master notification toggle
   */
  const updateMasterToggle = useCallback(
    async (enabled) => {
      try {
        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, masterEnabled: enabled }));

        await dispatch(
          updateNotificationPreference({ masterEnabled: enabled }, targetId)
        );

        showSnackbar(
          enabled ? "All notifications enabled" : "All notifications disabled",
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update notification settings", "error");
        console.error("Error updating master toggle:", error);
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, preferences, targetId]
  );

  /**
   * Update global notification setting (DND, Sound, Browser)
   */
  const updateGlobalSetting = useCallback(
    async (settingKey, value) => {
      try {
        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [settingKey]: value }));

        await dispatch(
          updateNotificationPreference({ [settingKey]: value }, targetId)
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
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, preferences, targetId]
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

        // Convert snake_case to camelCase and append "ServiceEnabled"
        // expense_service -> expenseServiceEnabled
        // budget_service -> budgetServiceEnabled
        const camelCaseId = serviceId
          .split("_")
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
        const fieldName = `${camelCaseId}Enabled`;

        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [fieldName]: enabled }));

        await dispatch(
          updateNotificationPreference({ [fieldName]: enabled }, targetId)
        );

        showSnackbar(
          `${serviceName} notifications ${enabled ? "enabled" : "disabled"}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update service notifications", "error");
        console.error("Error updating service toggle:", error);
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, preferences, targetId]
  );

  /**
   * Update individual notification toggle
   */
  const updateNotificationToggle = useCallback(
    async (notificationId, enabled) => {
      try {
        // Convert snake_case to camelCase and append "Enabled"
        // expense_added -> expenseAddedEnabled
        // bill_due_soon -> billDueSoonEnabled
        const camelCaseId = notificationId
          .split("_")
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
        const fieldName = `${camelCaseId}Enabled`;

        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [fieldName]: enabled }));

        await dispatch(
          updateNotificationPreference({ [fieldName]: enabled }, targetId)
        );

        showSnackbar(
          `Notification ${enabled ? "enabled" : "disabled"}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update notification", "error");
        console.error("Error updating notification toggle:", error);
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, preferences, targetId]
  );

  /**
   * Update notification frequency
   * Stores in JSON field for flexibility
   */
  const updateNotificationFrequency = useCallback(
    async (notificationId, frequency) => {
      try {
        // Parse existing JSON preferences or create new object
        const jsonPrefs = localPreferences?.notificationPreferencesJson
          ? JSON.parse(localPreferences.notificationPreferencesJson)
          : {};

        // Update frequency in JSON
        if (!jsonPrefs.frequency) {
          jsonPrefs.frequency = {};
        }
        jsonPrefs.frequency[notificationId] = frequency;

        // Optimistic update
        setLocalPreferences((prev) => ({
          ...prev,
          notificationPreferencesJson: JSON.stringify(jsonPrefs),
        }));

        await dispatch(
          updateNotificationPreference(
            {
              notificationPreferencesJson: JSON.stringify(jsonPrefs),
            },
            targetId
          )
        );

        showSnackbar(
          `Notification frequency updated to ${frequency}`,
          "success"
        );
      } catch (error) {
        showSnackbar("Failed to update frequency", "error");
        console.error("Error updating frequency:", error);
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, localPreferences, preferences, targetId]
  );

  /**
   * Update notification delivery method
   * Stores in JSON field for flexibility
   */
  const updateNotificationMethod = useCallback(
    async (notificationId, method, enabled) => {
      try {
        // Parse existing JSON preferences or create new object
        const jsonPrefs = localPreferences?.notificationPreferencesJson
          ? JSON.parse(localPreferences.notificationPreferencesJson)
          : {};

        // Update delivery methods in JSON
        if (!jsonPrefs.deliveryMethods) {
          jsonPrefs.deliveryMethods = {};
        }
        if (!jsonPrefs.deliveryMethods[notificationId]) {
          jsonPrefs.deliveryMethods[notificationId] = [];
        }

        if (enabled) {
          if (!jsonPrefs.deliveryMethods[notificationId].includes(method)) {
            jsonPrefs.deliveryMethods[notificationId].push(method);
          }
        } else {
          jsonPrefs.deliveryMethods[notificationId] = jsonPrefs.deliveryMethods[
            notificationId
          ].filter((m) => m !== method);
        }

        // Optimistic update
        setLocalPreferences((prev) => ({
          ...prev,
          notificationPreferencesJson: JSON.stringify(jsonPrefs),
        }));

        await dispatch(
          updateNotificationPreference(
            {
              notificationPreferencesJson: JSON.stringify(jsonPrefs),
            },
            targetId
          )
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
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, localPreferences, preferences, targetId]
  );

  /**
   * Update quiet hours settings
   * Stores in JSON field for flexibility
   */
  const updateQuietHours = useCallback(
    async (quietHoursSettings) => {
      try {
        // Parse existing JSON preferences or create new object
        const jsonPrefs = localPreferences?.notificationPreferencesJson
          ? JSON.parse(localPreferences.notificationPreferencesJson)
          : {};

        // Update quiet hours in JSON
        jsonPrefs.quietHours = {
          ...jsonPrefs.quietHours,
          ...quietHoursSettings,
        };

        // Optimistic update
        setLocalPreferences((prev) => ({
          ...prev,
          notificationPreferencesJson: JSON.stringify(jsonPrefs),
        }));

        await dispatch(
          updateNotificationPreference(
            {
              notificationPreferencesJson: JSON.stringify(jsonPrefs),
            },
            targetId
          )
        );

        showSnackbar("Quiet hours updated", "success");
      } catch (error) {
        showSnackbar("Failed to update quiet hours", "error");
        console.error("Error updating quiet hours:", error);
        // Rollback on error
        setLocalPreferences(preferences);
      }
    },
    [dispatch, showSnackbar, localPreferences, preferences, targetId]
  );

  /**
   * Reset all notification settings to default
   */
  const resetToDefaults = useCallback(async () => {
    try {
      await dispatch(resetNotificationPreferences(targetId));
      showSnackbar("Notification settings reset to defaults", "success");
    } catch (error) {
      showSnackbar("Failed to reset settings", "error");
      console.error("Error resetting notification settings:", error);
    }
  }, [dispatch, showSnackbar, targetId]);

  return {
    preferences: localPreferences,
    loading,
    updating,
    error,
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
