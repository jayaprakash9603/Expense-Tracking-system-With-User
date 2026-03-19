import React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/useLanguage";

const FLOW_TABS = [
  { id: "all", labelKey: "chart.all" },
  { id: "outflow", labelKey: "dashboard.loss" },
  { id: "inflow", labelKey: "dashboard.gain" },
];

const ACTIVE_STYLES = {
  all: "bg-[#2563eb] text-white",
  outflow: "bg-[#ef4444] text-white",
  inflow: "bg-[#10b981] text-white",
};

export function FlowToggle({ value, onChange, className }) {
  const { t } = useLanguage();

  return (
    <div className={cn("grid grid-cols-3 md:flex md:items-center gap-1 w-full md:w-auto bg-muted rounded-lg p-1", className)}>
      {FLOW_TABS.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "h-9 md:h-8 w-full md:w-auto md:min-w-[72px] px-3 md:px-2 text-sm md:text-xs font-semibold rounded-md transition-colors",
              isActive
                ? `${ACTIVE_STYLES[tab.id]} shadow-sm`
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
