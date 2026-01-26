import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, useMediaQuery, Typography, Button, Divider } from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useSearchHighlight } from "../../hooks/useSearchHighlight";
import ToastNotification from "./ToastNotification";

// Import modular components
import SettingsHeader from "./Settings/components/SettingsHeader";
import SettingItem from "./Settings/components/SettingItem";
import NotificationServiceCard from "./Settings/components/NotificationServiceCard";
import NotificationItem from "./Settings/components/NotificationItem";

// Import custom hooks
import { useSnackbar } from "./Settings/hooks/useSnackbar";
import { useNotificationSettings } from "./Settings/hooks/useNotificationSettings";

// Import configuration
import {
  NOTIFICATION_SERVICES,
  GLOBAL_NOTIFICATION_SETTINGS,
} from "./Settings/constants/notificationConfig";

/**
 * Notification Settings Page Component
 * Comprehensive notification preferences management
 * Follows SOLID principles and DRY principle
 * Reusable architecture for future settings pages
 */
const NotificationSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { colors, mode } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isDark = mode === "dark";

  // Search highlight functionality
  const { isItemHighlighted, currentParams } = useSearchHighlight({
    highlightDuration: 4000,
  });

  // Custom hooks
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const {
    preferences,
    loading,
    updating,
    updateMasterToggle,
    updateGlobalSetting,
    updateServiceToggle,
    updateNotificationToggle,
    updateNotificationFrequency,
    updateNotificationMethod,
    resetToDefaults,
  } = useNotificationSettings(showSnackbar);

  // Expanded state for service cards
  const [expandedServices, setExpandedServices] = useState({});

  // Auto-expand service from URL parameter
  useEffect(() => {
    const serviceFromUrl = currentParams.service;
    if (serviceFromUrl) {
      setExpandedServices((prev) => ({
        ...prev,
        [serviceFromUrl]: true,
      }));
    }
  }, [currentParams.service]);

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  // Helper function to convert snake_case to camelCase
  const toCamelCase = (str) => {
    return str
      .split("_")
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");
  };

  // Helper function to check if a notification is enabled
  const isNotificationEnabled = (notificationId) => {
    if (!preferences) return false;

    // If master toggle is OFF, all notifications appear disabled
    if (!preferences.masterEnabled) return false;

    const camelCaseId = toCamelCase(notificationId);
    const fieldName = `${camelCaseId}Enabled`;
    return preferences[fieldName] || false;
  };

  // Helper function to check if a service is enabled
  const isServiceEnabled = (serviceId) => {
    if (!preferences) return false;

    // If master toggle is OFF, all services appear disabled
    if (!preferences.masterEnabled) return false;

    const camelCaseId = toCamelCase(serviceId);
    const fieldName = `${camelCaseId}Enabled`;
    return preferences[fieldName] || false;
  };

  // Helper function to get notification frequency from JSON
  const getNotificationFrequency = (notificationId) => {
    if (!preferences?.notificationPreferencesJson) return "instant";

    try {
      const jsonPrefs = JSON.parse(preferences.notificationPreferencesJson);
      return jsonPrefs?.frequency?.[notificationId] || "instant";
    } catch (e) {
      console.error("Error parsing notification preferences JSON:", e);
      return "instant";
    }
  };

  // Helper function to get delivery methods from JSON
  const getDeliveryMethods = (notificationId) => {
    console.log(`[getDeliveryMethods] Called for: ${notificationId}`);
    console.log(`[getDeliveryMethods] preferences:`, preferences);
    console.log(
      `[getDeliveryMethods] JSON field:`,
      preferences?.notificationPreferencesJson,
    );

    if (!preferences?.notificationPreferencesJson) {
      console.log(
        `[getDeliveryMethods] No JSON preferences for ${notificationId}, using defaults`,
      );
      return {
        inApp: true,
        email: false,
        push: false,
        sms: false,
      };
    }

    try {
      const jsonPrefs = JSON.parse(preferences.notificationPreferencesJson);
      const methods = jsonPrefs?.deliveryMethods?.[notificationId] || [];

      console.log(`[getDeliveryMethods] Parsed JSON:`, jsonPrefs);
      console.log(
        `[getDeliveryMethods] Methods array for ${notificationId}:`,
        methods,
      );

      const result = {
        inApp: methods.includes("in_app"),
        email: methods.includes("email"),
        push: methods.includes("push"),
        sms: methods.includes("sms"),
      };

      console.log(`[getDeliveryMethods] Returning:`, result);
      return result;
    } catch (e) {
      console.error(`[getDeliveryMethods] Error parsing JSON:`, e);
      return {
        inApp: true,
        email: false,
        push: false,
        sms: false,
      };
    }
  };

  // Count enabled notifications for a service
  const getEnabledNotificationsCount = (serviceId) => {
    if (!preferences) return 0;

    const notifications =
      NOTIFICATION_SERVICES[
        Object.keys(NOTIFICATION_SERVICES).find(
          (key) => NOTIFICATION_SERVICES[key].id === serviceId,
        )
      ]?.notifications || [];

    return notifications.filter((notif) => isNotificationEnabled(notif.id))
      .length;
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: isSmallScreen ? 0 : "8px",
        border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <SettingsHeader
        colors={colors}
        isSmallScreen={isSmallScreen}
        onBack={() => navigate(-1)}
        title="Notification Settings"
        subtitle="Manage how and when you receive notifications"
      />

      {/* Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: isSmallScreen ? 2 : 3,
          backgroundColor: colors.secondary_bg,
        }}
        className="custom-scrollbar"
      >
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          {/* Master Toggle Section */}
          <Box
            sx={{
              backgroundColor: colors.card_bg,
              border: `2px solid ${colors.primary_accent}`,
              borderRadius: "12px",
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${colors.card_bg}, ${colors.primary_accent}08)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${colors.primary_accent}, ${colors.primary_accent}CC)`,
                  boxShadow: `0 4px 14px ${colors.primary_accent}40`,
                }}
              >
                <NotificationsActiveIcon
                  sx={{ fontSize: 32, color: "#ffffff" }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: colors.text_primary,
                    mb: 0.5,
                  }}
                >
                  {GLOBAL_NOTIFICATION_SETTINGS.MASTER_TOGGLE.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text_muted, lineHeight: 1.5 }}
                >
                  {GLOBAL_NOTIFICATION_SETTINGS.MASTER_TOGGLE.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  transform: "scale(1.2)",
                }}
              >
                <SettingItem
                  icon={null}
                  title=""
                  description=""
                  isSwitch
                  switchChecked={preferences?.masterEnabled || false}
                  onSwitchChange={(e) => updateMasterToggle(e.target.checked)}
                  colors={colors}
                  hideBorder
                />
              </Box>
            </Box>

            {/* Quick Actions */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                pt: 2,
                borderTop: `1px solid ${colors.border_color}`,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={resetToDefaults}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: colors.border_color,
                  color: colors.text_muted,
                  "&:hover": {
                    borderColor: colors.primary_accent,
                    backgroundColor: `${colors.primary_accent}10`,
                    color: colors.primary_accent,
                  },
                }}
              >
                Reset to Defaults
              </Button>
            </Box>
          </Box>

          {/* Global Settings */}
          <Box
            sx={{
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              p: 2,
              mb: 3,
              opacity: preferences?.masterEnabled ? 1 : 0.5,
              pointerEvents: preferences?.masterEnabled ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.text_primary,
                mb: 2,
                fontSize: "16px",
              }}
            >
              Global Settings
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {/* Do Not Disturb */}
              <SettingItem
                icon={GLOBAL_NOTIFICATION_SETTINGS.DO_NOT_DISTURB.icon}
                title={GLOBAL_NOTIFICATION_SETTINGS.DO_NOT_DISTURB.title}
                description={
                  GLOBAL_NOTIFICATION_SETTINGS.DO_NOT_DISTURB.description
                }
                isSwitch
                switchChecked={preferences?.doNotDisturb || false}
                onSwitchChange={(e) =>
                  updateGlobalSetting("doNotDisturb", e.target.checked)
                }
                colors={colors}
                disabled={!preferences?.masterEnabled}
              />

              <Divider sx={{ my: 0.5, borderColor: colors.border_color }} />

              {/* Notification Sound */}
              <SettingItem
                icon={GLOBAL_NOTIFICATION_SETTINGS.NOTIFICATION_SOUND.icon}
                title={GLOBAL_NOTIFICATION_SETTINGS.NOTIFICATION_SOUND.title}
                description={
                  GLOBAL_NOTIFICATION_SETTINGS.NOTIFICATION_SOUND.description
                }
                isSwitch
                switchChecked={preferences?.notificationSound || false}
                onSwitchChange={(e) =>
                  updateGlobalSetting("notificationSound", e.target.checked)
                }
                colors={colors}
                disabled={!preferences?.masterEnabled}
              />

              <Divider sx={{ my: 0.5, borderColor: colors.border_color }} />

              {/* Browser Notifications */}
              <SettingItem
                icon={GLOBAL_NOTIFICATION_SETTINGS.BROWSER_NOTIFICATIONS.icon}
                title={GLOBAL_NOTIFICATION_SETTINGS.BROWSER_NOTIFICATIONS.title}
                description={
                  GLOBAL_NOTIFICATION_SETTINGS.BROWSER_NOTIFICATIONS.description
                }
                isSwitch
                switchChecked={preferences?.browserNotifications || false}
                onSwitchChange={(e) =>
                  updateGlobalSetting("browserNotifications", e.target.checked)
                }
                colors={colors}
                disabled={!preferences?.masterEnabled}
              />

              <Divider sx={{ my: 0.5, borderColor: colors.border_color }} />

              {/* Floating Notifications */}
              <SettingItem
                icon={GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS.icon}
                title={
                  GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS.title
                }
                description={
                  GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS
                    .description
                }
                isSwitch
                switchChecked={preferences?.floatingNotifications || false}
                onSwitchChange={(e) =>
                  updateGlobalSetting("floatingNotifications", e.target.checked)
                }
                colors={colors}
                disabled={!preferences?.masterEnabled}
              />
            </Box>
          </Box>

          {/* Service-specific Notifications */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.text_primary,
              mb: 2,
              fontSize: "18px",
              opacity: preferences?.masterEnabled ? 1 : 0.5,
              transition: "opacity 0.3s ease",
            }}
          >
            Notifications by Service
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              opacity: preferences?.masterEnabled ? 1 : 0.5,
              pointerEvents: preferences?.masterEnabled ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            {Object.values(NOTIFICATION_SERVICES).map((service) => {
              const notificationCount = service.notifications.length;
              const enabledCount = getEnabledNotificationsCount(service.id);
              const serviceEnabled = isServiceEnabled(service.id);

              return (
                <Box
                  id={`setting-${service.id}`}
                  key={service.id}
                  className={
                    isItemHighlighted(service.id)
                      ? "setting-item-highlighted"
                      : ""
                  }
                  sx={{
                    borderRadius: "12px",
                    transition: "all 0.3s ease-in-out",
                    ...(isItemHighlighted(service.id) && {
                      boxShadow: `0 0 0 2px ${colors.primary_accent}`,
                    }),
                  }}
                >
                  <NotificationServiceCard
                    service={service}
                    serviceEnabled={serviceEnabled}
                    onServiceToggle={(enabled) =>
                      updateServiceToggle(service.id, enabled)
                    }
                    expanded={expandedServices[service.id] || false}
                    onToggleExpand={() => toggleServiceExpansion(service.id)}
                    colors={colors}
                    notificationCount={notificationCount}
                    enabledCount={enabledCount}
                  >
                    {/* Individual Notifications */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {service.notifications.map((notification) => (
                        <Box
                          id={`setting-${notification.id}`}
                          key={notification.id}
                          className={
                            isItemHighlighted(notification.id)
                              ? "setting-item-highlighted"
                              : ""
                          }
                          sx={{
                            borderRadius: "8px",
                            transition: "all 0.3s ease-in-out",
                            ...(isItemHighlighted(notification.id) && {
                              backgroundColor: `${colors.primary_accent}15`,
                              boxShadow: `0 0 0 2px ${colors.primary_accent}`,
                              p: 1,
                              mx: -1,
                            }),
                          }}
                        >
                          <NotificationItem
                            notification={notification}
                            preferences={{
                              enabled: isNotificationEnabled(notification.id),
                              frequency: getNotificationFrequency(
                                notification.id,
                              ),
                              methods: getDeliveryMethods(notification.id),
                            }}
                            onToggle={(enabled) =>
                              updateNotificationToggle(notification.id, enabled)
                            }
                            onFrequencyChange={(frequency) =>
                              updateNotificationFrequency(
                                notification.id,
                                frequency,
                              )
                            }
                            onMethodToggle={(method, enabled) =>
                              updateNotificationMethod(
                                notification.id,
                                method,
                                enabled,
                              )
                            }
                            colors={colors}
                            serviceEnabled={serviceEnabled}
                            serviceColor={service.color}
                          />
                        </Box>
                      ))}
                    </Box>
                  </NotificationServiceCard>
                </Box>
              );
            })}
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: `${colors.primary_accent}10`,
              border: `1px solid ${colors.primary_accent}30`,
              borderRadius: "8px",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.text_muted, fontSize: "13px" }}
            >
              💡 <strong>Tip:</strong> Click on any notification to customize
              its frequency and delivery methods. All changes are saved
              automatically.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Toast Notification */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        onClose={closeSnackbar}
        severity={snackbar.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      {/* Custom Scrollbar Styles + Highlight Animation */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.secondary_bg};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary_accent};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary_accent};
          opacity: 0.8;
        }
        
        /* Highlight animation for search results */
        @keyframes settingHighlightPulse {
          0% {
            box-shadow: 0 0 0 0 ${colors.primary_accent}66;
          }
          50% {
            box-shadow: 0 0 0 10px ${colors.primary_accent}00;
          }
          100% {
            box-shadow: 0 0 0 0 ${colors.primary_accent}00;
          }
        }
        
        .setting-item-highlighted {
          animation: settingHighlightPulse 1s ease-in-out 3;
        }
      `}</style>
    </Box>
  );
};

export default NotificationSettings;
