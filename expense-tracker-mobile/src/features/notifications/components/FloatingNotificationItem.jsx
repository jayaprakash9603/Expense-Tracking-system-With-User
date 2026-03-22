import React from "react";
import { Bell, X } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function FloatingNotificationItem({ item, onDismiss, className }) {
  const { t } = useLanguage();
  return (
    <div className={cn("w-[20rem] rounded-lg border border-border bg-card p-3 shadow-lg", className)}>
      <div className="flex items-start gap-2">
        <Bell className="mt-0.5 h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">
            {item.title || t("notifications.defaultTitle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {item.message || item.body || t("notifications.defaultBody")}
          </p>
        </div>
        <AppButton
          intent="ghost"
          density="compact"
          className="h-7 w-7 p-0"
          onClick={() => onDismiss(item.id)}
        >
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );
}

export default FloatingNotificationItem;
