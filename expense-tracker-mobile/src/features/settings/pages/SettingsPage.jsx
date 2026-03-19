import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PageContainer } from "@/shared/components/PageContainer";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { SETTINGS_SECTIONS } from "@/features/settings/constants/settingsConfig";
import { SettingSection } from "@/features/settings/components/SettingSection";
import { SettingItem } from "@/features/settings/components/SettingItem";
import { AppInfoSection } from "@/features/settings/components/AppInfoSection";
import { ChangePasswordDialog } from "@/features/settings/components/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/features/settings/components/DeleteAccountDialog";
import { useSettingsState } from "@/features/settings/hooks/useSettingsState";
import { useSettingsActions } from "@/features/settings/hooks/useSettingsActions";
import { fetchOrCreateUserSettings } from "@/redux/userSettings/userSettings.actions";
import { applyUserSettingsEnhancements } from "@/shared/utils/themeInjector";

export function SettingsPage() {
  const dispatch = useDispatch();
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

  useEffect(() => {
    dispatch(fetchOrCreateUserSettings());
  }, [dispatch]);

  useEffect(() => {
    applyUserSettingsEnhancements(settings);
  }, [settings]);

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
          <SettingItem
            key={item.id}
            item={item}
            value={settings[item.stateKey]}
            onChange={getChangeHandler(item)}
            onAction={executeAction}
            disabled={isItemDisabled(item)}
          />
        ))}
      </SettingSection>
    );
  };

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <div className="settings-grid">
        {SETTINGS_SECTIONS.map(renderSection)}
      </div>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <DeleteAccountDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} />
    </PageContainer>
  );
}

export default SettingsPage;
