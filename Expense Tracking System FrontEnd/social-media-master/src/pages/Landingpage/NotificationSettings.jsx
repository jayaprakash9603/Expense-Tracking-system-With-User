import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, useMediaQuery, Typography, Button, Divider } from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
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
  const { colors, mode } = useTheme();
  const { settings: userSettings } = useSelector(
    (state) => state.userSettings || {}
  );
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isDark = mode === "dark";

  // Custom hooks
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const {
    notificationPreferences,
    updateMasterToggle,
    updateGlobalSetting,
    updateServiceToggle,
    updateNotificationToggle,
    updateNotificationFrequency,
    updateNotificationMethod,
    resetToDefaults,
  } = useNotificationSettings(userSettings, showSnackbar);

  // Expanded state for service cards
  const [expandedServices, setExpandedServices] = useState({});

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  // Count enabled notifications for a service
  const getEnabledNotificationsCount = (serviceId) => {
    const servicePrefs = notificationPreferences.services[serviceId];
    if (!servicePrefs) return 0;

    const notifications =
      NOTIFICATION_SERVICES[
        Object.keys(NOTIFICATION_SERVICES).find(
          (key) => NOTIFICATION_SERVICES[key].id === serviceId
        )
      ]?.notifications || [];

    return notifications.filter(
      (notif) => servicePrefs.notifications[notif.id]?.enabled
    ).length;
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
                  switchChecked={notificationPreferences.masterEnabled}
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
                switchChecked={notificationPreferences.doNotDisturb}
                onSwitchChange={(e) =>
                  updateGlobalSetting("doNotDisturb", e.target.checked)
                }
                colors={colors}
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
                switchChecked={notificationPreferences.notificationSound}
                onSwitchChange={(e) =>
                  updateGlobalSetting("notificationSound", e.target.checked)
                }
                colors={colors}
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
                switchChecked={notificationPreferences.browserNotifications}
                onSwitchChange={(e) =>
                  updateGlobalSetting("browserNotifications", e.target.checked)
                }
                colors={colors}
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
            }}
          >
            Notifications by Service
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.values(NOTIFICATION_SERVICES).map((service) => {
              const servicePrefs = notificationPreferences.services[service.id];
              const notificationCount = service.notifications.length;
              const enabledCount = getEnabledNotificationsCount(service.id);

              return (
                <NotificationServiceCard
                  key={service.id}
                  service={service}
                  serviceEnabled={servicePrefs?.enabled ?? true}
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
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {service.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        preferences={
                          servicePrefs?.notifications[notification.id]
                        }
                        onToggle={(enabled) =>
                          updateNotificationToggle(
                            service.id,
                            notification.id,
                            enabled
                          )
                        }
                        onFrequencyChange={(frequency) =>
                          updateNotificationFrequency(
                            service.id,
                            notification.id,
                            frequency
                          )
                        }
                        onMethodToggle={(method, enabled) =>
                          updateNotificationMethod(
                            service.id,
                            notification.id,
                            method,
                            enabled
                          )
                        }
                        colors={colors}
                        serviceEnabled={servicePrefs?.enabled ?? true}
                        serviceColor={service.color}
                      />
                    ))}
                  </Box>
                </NotificationServiceCard>
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

      {/* Custom Scrollbar Styles */}
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
      `}</style>
    </Box>
  );
};

export default NotificationSettings;
