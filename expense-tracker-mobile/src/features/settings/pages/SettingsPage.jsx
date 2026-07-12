import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { SETTINGS_SECTIONS } from "@/features/settings/constants/settingsConfig";
import { FeatureGate } from "@/shared/components/feedback/FeatureGate";
import { SettingSection } from "@/features/settings/components/sections/SettingSection";
import { SettingItem } from "@/features/settings/components/sections/SettingItem";
import { AppInfoSection } from "@/features/settings/components/sections/AppInfoSection";
import { ChangePasswordDialog } from "@/features/settings/components/dialogs/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/features/settings/components/dialogs/DeleteAccountDialog";
import { useSettingsState } from "@/features/settings/hooks/useSettingsState";
import { useSettingsActions } from "@/features/settings/hooks/useSettingsActions";
import { fetchOrCreateUserSettings } from "@/redux/userSettings/userSettings.actions";
import { applyUserSettingsEnhancements } from "@/shared/utils/theme/themeInjector";

export function SettingsPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useLanguage();
  const { settings, updateSetting } = useSettingsState();
  const {
    handleThemeToggle,
    handleLanguageChange,
    executeAction,
    changePasswordOpen,
    setChangePasswordOpen,
    deleteAccountOpen,
    setDeleteAccountOpen,
  } = useSettingsActions(updateSetting);

  const itemRefs = useRef({});

  useEffect(() => {
    dispatch(fetchOrCreateUserSettings());
  }, [dispatch]);

  useEffect(() => {
    applyUserSettingsEnhancements(settings);
  }, [settings]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");
    
    if (highlightId && itemRefs.current[highlightId]) {
      const element = itemRefs.current[highlightId];
      
      // Add highlight class
      element.classList.add("bg-primary/10", "ring-2", "ring-primary/50", "rounded-lg", "transition-all", "duration-1000");
      
      // Scroll into view
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Remove highlight after a few seconds
        setTimeout(() => {
          element.classList.remove("bg-primary/10", "ring-2", "ring-primary/50");
        }, 3000);
      }, 100);
    }
  }, [location.search]);

  const getChangeHandler = (item) => {
    if (item.id === "themeMode") return handleThemeToggle;
    if (item.id === "language") return handleLanguageChange;
    if (item.stateKey) return (value) => updateSetting(item.settingsKey, value);
    return undefined;
  };

  const isItemDisabled = (item) => {
    if (!item.dependsOn) return false;
    return !settings[item.dependsOn];
  };

  const renderSection = (section) => {
    if (section.isInfoSection) {
      return <AppInfoSection key={section.id} />;
    }

    return (
      <SettingSection key={section.id} icon={section.icon} titleKey={section.titleKey}>
        {section.items.map((item) => (
          <div 
            key={item.id} 
            ref={(el) => (itemRefs.current[item.id] = el)}
            className="px-2 -mx-2"
          >
            <SettingItem
              item={item}
              value={settings[item.stateKey]}
              onChange={getChangeHandler(item)}
              onAction={executeAction}
              disabled={isItemDisabled(item)}
            />
          </div>
        ))}
      </SettingSection>
    );
  };

  return (
    <PageContainer maxWidth="full" className="pb-8 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {SETTINGS_SECTIONS.map((section) => (
          <FeatureGate key={section.id} flagKey={section.featureFlagKey}>
            {renderSection(section)}
          </FeatureGate>
        ))}
      </div>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <DeleteAccountDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} />
    </PageContainer>
  );
}

export default SettingsPage;
