import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useAppConfig } from "@/shared/hooks/useAppConfig";
import {
  DASHBOARD_QUICK_ACCESS_ACTIONS,
  DASHBOARD_QUICK_ACCESS_COLOR_MAP,
} from "@/features/dashboard/config/quickAccessActions";

export function QuickAccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { animation } = usePresentation();
  const { featureFlags } = useAppConfig();
  const actions = useMemo(
    () =>
      DASHBOARD_QUICK_ACCESS_ACTIONS.filter((a) => {
        if (!a.featureFlag) return true;
        return Boolean(featureFlags[a.featureFlag]);
      }),
    [featureFlags],
  );

  return (
    <div
      className={cn(
        "grid w-full gap-2 sm:gap-3",
        "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8",
      )}
    >
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => navigate(action.path)}
          className={cn(
            "flex min-h-[44px] w-full min-w-0 items-center justify-start gap-2 rounded-xl border border-border bg-card px-3 py-2.5",
            "text-left text-sm font-medium sm:px-4",
            animation.enabled && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              DASHBOARD_QUICK_ACCESS_COLOR_MAP[action.color],
            )}
          >
            <AppIcon icon={action.icon} size="sm" className="!text-current" />
          </div>
          <span className="flex min-w-0 items-center gap-1">
            <Plus className="h-3 w-3 shrink-0" />
            <span className="truncate">{t(action.labelKey)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default QuickAccess;
