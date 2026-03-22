import React from "react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function SettingSection({ icon: Icon, titleKey, children }) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <AppIcon icon={Icon} color="primary" size="md" />
        <h2 className="text-base md:text-lg font-semibold">{t(titleKey)}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export default SettingSection;
