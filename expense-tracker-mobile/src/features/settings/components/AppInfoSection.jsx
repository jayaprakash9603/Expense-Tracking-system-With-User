import React from "react";
import { Info } from "lucide-react";
import { AppIcon, AppIconBox } from "@/shared/components/AppIcon";
import { APP_INFO } from "@/features/settings/constants/settingsConfig";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { APP_NAME } from "@/config/constants";

export function AppInfoSection() {
  const { t } = useLanguage();

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <AppIcon icon={Info} color="primary" size="md" />
        <h2 className="text-base md:text-lg font-semibold">{t("settings.sections.about")}</h2>
      </div>
      <div className="flex flex-col items-center text-center py-4">
        <AppIconBox icon={CircleDollarIcon} color="primary" size="xl" className="mb-3 h-14 w-14 rounded-2xl" />
        <h3 className="text-lg font-bold">{APP_NAME}</h3>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p>{t("settings.version")}: {APP_INFO.version}</p>
          <p>{t("settings.build")}: {APP_INFO.build}</p>
          <p>{t("settings.lastUpdated")}: {APP_INFO.lastUpdated}</p>
        </div>
      </div>
    </section>
  );
}

function CircleDollarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

export default AppInfoSection;
