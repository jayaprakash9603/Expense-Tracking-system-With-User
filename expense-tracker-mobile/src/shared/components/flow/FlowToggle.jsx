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
    <div
      className={cn(
        "grid w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 touch-manipulation md:flex md:w-auto md:items-center",
        className,
      )}
    >
      {FLOW_TABS.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "!cursor-pointer h-9 w-full select-none rounded-md px-3 text-sm font-semibold transition-colors",
              "touch-manipulation md:h-8 md:w-auto md:min-w-[72px] md:px-2 md:text-xs",
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
