import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, useMediaQuery, Chip } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import ToastNotification from "./ToastNotification";
import { fetchNotificationPreferences } from "../../Redux/NotificationPreferences/notificationPreferences.action";

// Import modular components
import SettingsHeader from "./Settings/components/SettingsHeader";
import SettingSection from "./Settings/components/SettingSection";
import SettingItem from "./Settings/components/SettingItem";
import AppInfoSection from "./Settings/components/AppInfoSection";
import DeleteAccountDialog from "./Settings/components/DeleteAccountDialog";
import ChangePasswordDialog from "./Settings/components/ChangePasswordDialog";

// Import custom hooks
import { useSnackbar } from "./Settings/hooks/useSnackbar";
import { useDialogState } from "./Settings/hooks/useDialogState";
import { useSettingsState } from "./Settings/hooks/useSettingsState";
import { useSettingsActions } from "./Settings/hooks/useSettingsActions";

// Import configuration and utilities
import {
  SETTINGS_SECTIONS,
  PROFILE_VISIBILITY_MESSAGES,
} from "./Settings/constants/settingsConfig";
import {
  getThemeIcon,
  getThemeDescription,
  getProfileVisibilityLabel,
  getToggleMessage,
} from "./Settings/utils/settingsHelpers";

/**
 * Settings Page Component - Refactored for Modularity
 * Follows SOLID Principles:
 * - Single Responsibility: Each component handles one concern
 * - Open/Closed: Extensible through configuration
 * - Liskov Substitution: Components are interchangeable
 * - Interface Segregation: Clean, minimal interfaces
 * - Dependency Inversion: Depends on abstractions (hooks)
 *
 * Follows DRY Principle:
 * - Configuration-driven rendering
 * - Reusable components and hooks
 * - Centralized constants
 */
const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const { settings: userSettings } = useSelector(
    (state) => state.userSettings || {}
  );
  const notificationPreferences = useSelector(
    (state) => state.notificationPreferences?.preferences
  );
  const userId = useSelector((state) => state.auth?.user?.id);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isDark = mode === "dark";

  // Fetch notification preferences on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchNotificationPreferences());
    }
  }, [dispatch, userId]);

  // Custom hooks for state management
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const {
    deleteDialogOpen,
    passwordDialogOpen,
    closeDeleteDialog,
    closePasswordDialog,
    setDeleteDialogOpen,
    setPasswordDialogOpen,
  } = useDialogState();
  const { settingsState, updateSetting } = useSettingsState(
    userSettings,
    showSnackbar
  );
  const { handleThemeToggle, executeAction } = useSettingsActions(
    navigate,
    showSnackbar,
    setDeleteDialogOpen,
    setPasswordDialogOpen,
    isDark
  );

  // Render switch-type setting
  const renderSwitchSetting = (item) => {
    const stateKey = item.stateKey;
    const settingsKey = item.settingsKey;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={item.title}
        description={item.description}
        isSwitch
        switchChecked={settingsState[stateKey]}
        onSwitchChange={(e) => {
          const checked = e.target.checked;
          updateSetting(stateKey, checked);
          updateSetting(
            settingsKey,
            checked,
            getToggleMessage(item.title, checked)
          );
        }}
        colors={colors}
      />
    );
  };

  // Render select-type setting
  const renderSelectSetting = (item) => {
    const stateKey = item.stateKey;
    const settingsKey = item.settingsKey;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={item.title}
        description={item.description}
        isSelect
        selectValue={settingsState[stateKey]}
        selectOptions={item.options}
        onSelectChange={(e) => {
          const value = e.target.value;
          updateSetting(stateKey, value);
          const message = item.customMessage
            ? PROFILE_VISIBILITY_MESSAGES[value]
            : `${item.title} updated`;
          updateSetting(settingsKey, value, message);
        }}
        colors={colors}
      />
    );
  };

  // Render button-type setting
  const renderButtonSetting = (item) => (
    <SettingItem
      key={item.id}
      icon={item.icon}
      title={item.title}
      description={item.description}
      isButton
      buttonText={item.buttonText}
      onButtonClick={() => executeAction(item.action)}
      isDanger={item.isDanger}
      colors={colors}
    />
  );

  // Render navigation-type setting
  const renderNavigationSetting = (item) => {
    // Check if this item should show status (notification settings)
    const shouldShowStatus =
      item.showStatus && item.id === "notificationSettings";
    const masterEnabled = notificationPreferences?.masterEnabled ?? false;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={item.title}
        description={item.description}
        isNavigation
        onNavigationClick={() => executeAction(item.action)}
        colors={colors}
        statusChip={
          shouldShowStatus ? (
            <Chip
              label={masterEnabled ? "ON" : "OFF"}
              size="small"
              sx={{
                backgroundColor: masterEnabled ? "#14b8a6" : "#64748b",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: "22px",
                marginRight: "8px",
                "& .MuiChip-label": {
                  padding: "0 8px",
                },
              }}
            />
          ) : null
        }
      />
    );
  };

  // Render slider-type setting
  const renderSliderSetting = (item) => {
    const stateKey = item.stateKey;
    const settingsKey = item.settingsKey;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={item.title}
        description={item.description}
        isSlider
        sliderValue={settingsState[stateKey]}
        sliderMin={item.min}
        sliderMax={item.max}
        sliderStep={item.step}
        sliderMarks={item.marks}
        onSliderChange={(e, value) => {
          updateSetting(stateKey, value);
          updateSetting(
            settingsKey,
            value,
            `${item.title} updated to ${value}`
          );
        }}
        colors={colors}
      />
    );
  };

  // Render setting item based on type
  const renderSettingItem = (item) => {
    // Special handling for theme toggle
    if (item.id === "theme") {
      return (
        <SettingItem
          key={item.id}
          icon={getThemeIcon(isDark)}
          title={item.title}
          description={getThemeDescription(isDark)}
          isSwitch
          switchChecked={isDark}
          onSwitchChange={handleThemeToggle}
          colors={colors}
        />
      );
    }

    switch (item.type) {
      case "switch":
        return renderSwitchSetting(item);
      case "select":
        return renderSelectSetting(item);
      case "button":
        return renderButtonSetting(item);
      case "navigation":
        return renderNavigationSetting(item);
      case "slider":
        return renderSliderSetting(item);
      default:
        return null;
    }
  };

  // Render settings section
  const renderSection = (section) => {
    if (section.type === "info") {
      return <AppInfoSection key={section.id} colors={colors} />;
    }

    return (
      <SettingSection
        key={section.id}
        icon={section.icon}
        title={section.title}
        colors={colors}
        showChip={section.showChip}
        chipLabel={
          section.showChip
            ? getProfileVisibilityLabel(settingsState.profileVisibility)
            : ""
        }
      >
        {section.items.map((item) => renderSettingItem(item))}
      </SettingSection>
    );
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
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          {/* Render all sections dynamically */}
          {Object.values(SETTINGS_SECTIONS).map((section) =>
            renderSection(section)
          )}
        </Box>
      </Box>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => {
          closeDeleteDialog();
          showSnackbar("Account deletion cancelled", "info");
        }}
        colors={colors}
        isSmallScreen={isSmallScreen}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={closePasswordDialog}
        onConfirm={(passwordData) => {
          closePasswordDialog();
          showSnackbar("Password changed successfully", "success");
        }}
        colors={colors}
        isSmallScreen={isSmallScreen}
      />

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

export default Settings;
