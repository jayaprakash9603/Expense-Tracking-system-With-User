import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, useMediaQuery, Chip } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import {
  useSearchHighlight,
  highlightAnimationStyles,
} from "../../hooks/useSearchHighlight";
import ToastNotification from "./ToastNotification";
import { fetchNotificationPreferences } from "../../Redux/NotificationPreferences/notificationPreferences.action";

// Import modular components
import SettingsHeader from "./Settings/components/SettingsHeader";
import SettingSection from "./Settings/components/SettingSection";
import SettingItem from "./Settings/components/SettingItem";
import AppInfoSection from "./Settings/components/AppInfoSection";
import DeleteAccountDialog from "./Settings/components/DeleteAccountDialog";
import ChangePasswordDialog from "./Settings/components/ChangePasswordDialog";
import ThemePicker from "../../components/ThemePicker";

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
  const [searchParams] = useSearchParams();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const { settings: userSettings } = useSelector(
    (state) => state.userSettings || {},
  );
  const notificationPreferences = useSelector(
    (state) => state.notificationPreferences?.preferences,
  );
  const userId = useSelector((state) => state.auth?.user?.id);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isDark = mode === "dark";

  // Search highlight functionality
  const { isItemHighlighted, isSectionHighlighted, currentParams } =
    useSearchHighlight({ highlightDuration: 4000 });

  // Scroll position restoration
  useEffect(() => {
    // Restore scroll position when returning to this page
    const savedScrollPosition = sessionStorage.getItem(
      "settingsScrollPosition",
    );
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem("settingsScrollPosition");
      }, 0);
    }
  }, []);

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
    showSnackbar,
  );
  const { handleThemeToggle, handleLanguageChange, executeAction } =
    useSettingsActions(
      navigate,
      showSnackbar,
      setDeleteDialogOpen,
      setPasswordDialogOpen,
      isDark,
    );

  // Render switch-type setting
  const renderSwitchSetting = (item) => {
    const stateKey = item.stateKey;
    const settingsKey = item.settingsKey;
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey
      ? t(item.descriptionKey)
      : item.description;

    // Check if this is a sub-option that depends on a parent setting
    const isSubOption = item.indent;
    const parentEnabled = isSubOption
      ? settingsState.keyboardShortcuts // For showShortcutIndicators, parent is keyboardShortcuts
      : true;

    return (
      <Box
        key={item.id}
        sx={{
          pl: isSubOption ? 4 : 0, // Indent sub-options
          opacity: isSubOption && !parentEnabled ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <SettingItem
          icon={item.icon}
          title={title}
          description={description}
          isSwitch
          switchChecked={settingsState[stateKey]}
          onSwitchChange={(e) => {
            const checked = e.target.checked;
            if (stateKey === settingsKey) {
              updateSetting(
                stateKey,
                checked,
                getToggleMessage(title, checked),
              );
              return;
            }
            updateSetting(stateKey, checked);
            updateSetting(
              settingsKey,
              checked,
              getToggleMessage(title, checked),
            );
          }}
          colors={colors}
          disabled={isSubOption && !parentEnabled}
        />
      </Box>
    );
  };

  // Render select-type setting
  const renderSelectSetting = (item) => {
    const stateKey = item.stateKey;
    const settingsKey = item.settingsKey;
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey
      ? t(item.descriptionKey)
      : item.description;

    // Special handling for language select
    if (item.id === "language") {
      return (
        <SettingItem
          key={item.id}
          icon={item.icon}
          title={title}
          description={description}
          isSelect
          selectValue={settingsState[stateKey]}
          selectOptions={item.options}
          onSelectChange={(e) => {
            const value = e.target.value;
            updateSetting(stateKey, value);
            handleLanguageChange(value); // Use dedicated language handler
          }}
          colors={colors}
        />
      );
    }

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={title}
        description={description}
        isSelect
        selectValue={settingsState[stateKey]}
        selectOptions={item.options}
        onSelectChange={(e) => {
          const value = e.target.value;
          updateSetting(stateKey, value);
          const message = item.customMessage
            ? PROFILE_VISIBILITY_MESSAGES[value]
            : `${title} updated`;
          updateSetting(settingsKey, value, message);
        }}
        colors={colors}
      />
    );
  };

  // Render button-type setting
  const renderButtonSetting = (item) => {
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey
      ? t(item.descriptionKey)
      : item.description;
    const buttonText = item.buttonTextKey
      ? t(item.buttonTextKey)
      : item.buttonText;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={title}
        description={description}
        isButton
        buttonText={buttonText}
        onButtonClick={() => executeAction(item.action)}
        isDanger={item.isDanger}
        colors={colors}
      />
    );
  };

  // Render navigation-type setting
  const renderNavigationSetting = (item) => {
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey
      ? t(item.descriptionKey)
      : item.description;

    // Check if this item should show status (notification settings)
    const shouldShowStatus =
      item.showStatus && item.id === "notificationSettings";
    const masterEnabled = notificationPreferences?.masterEnabled ?? false;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={title}
        description={description}
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
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey
      ? t(item.descriptionKey)
      : item.description;

    return (
      <SettingItem
        key={item.id}
        icon={item.icon}
        title={title}
        description={description}
        isSlider
        sliderValue={settingsState[stateKey]}
        sliderMin={item.min}
        sliderMax={item.max}
        sliderStep={item.step}
        sliderMarks={item.marks}
        onSliderChange={(e, value) => {
          updateSetting(stateKey, value);
          updateSetting(settingsKey, value, `${title} updated to ${value}`);
        }}
        colors={colors}
      />
    );
  };

  // Render setting item based on type with highlight support
  const renderSettingItem = (item) => {
    const isHighlighted = isItemHighlighted(item.id);

    // Wrapper with ID and highlight styles
    const wrapWithHighlight = (component) => (
      <Box
        id={`setting-${item.id}`}
        key={item.id}
        className={isHighlighted ? "setting-item-highlighted" : ""}
        sx={{
          transition: "all 0.3s ease-in-out",
          borderRadius: "12px",
          ...(isHighlighted && {
            backgroundColor: `${colors.primary_accent}15`,
            boxShadow: `0 0 0 2px ${colors.primary_accent}`,
            mx: -1,
            px: 1,
          }),
        }}
      >
        {component}
      </Box>
    );

    // Special handling for theme toggle
    if (item.id === "theme") {
      return wrapWithHighlight(
        <SettingItem
          icon={getThemeIcon(isDark)}
          title={t("settings.theme")}
          description={
            isDark ? t("settings.themeDark") : t("settings.themeLight")
          }
          isSwitch
          switchChecked={isDark}
          onSwitchChange={handleThemeToggle}
          colors={colors}
        />,
      );
    }

    let component;
    switch (item.type) {
      case "switch":
        component = renderSwitchSetting(item);
        break;
      case "select":
        component = renderSelectSetting(item);
        break;
      case "button":
        component = renderButtonSetting(item);
        break;
      case "navigation":
        component = renderNavigationSetting(item);
        break;
      case "slider":
        component = renderSliderSetting(item);
        break;
      case "themePicker":
        component = (
          <Box key={item.id} sx={{ py: 2 }}>
            <ThemePicker showModeToggle={false} compact={true} />
          </Box>
        );
        break;
      default:
        return null;
    }

    return wrapWithHighlight(component);
  };

  // Render settings section with highlight support
  const renderSection = (section) => {
    if (section.type === "info") {
      return <AppInfoSection key={section.id} colors={colors} />;
    }

    const title = section.titleKey ? t(section.titleKey) : section.title;
    const isSectionActive = isSectionHighlighted(section.id);

    return (
      <Box
        id={`setting-${section.id}`}
        key={section.id}
        className={isSectionActive ? "setting-section-highlighted" : ""}
      >
        <SettingSection
          icon={section.icon}
          title={title}
          colors={colors}
          showChip={section.showChip}
          chipLabel={
            section.showChip
              ? getProfileVisibilityLabel(settingsState.profileVisibility, t)
              : ""
          }
          isHighlighted={isSectionActive}
        >
          {section.items.map((item) => renderSettingItem(item))}
        </SettingSection>
      </Box>
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
            renderSection(section),
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
        
        .setting-section-highlighted {
          animation: settingHighlightPulse 0.8s ease-in-out 2;
        }
      `}</style>
    </Box>
  );
};

export default Settings;
