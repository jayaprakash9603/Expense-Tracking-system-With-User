import React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/useLanguage";

const FLOW_TABS = [
  { id: "all", labelKey: "chart.all", color: null },
  { id: "outflow", labelKey: "dashboard.loss", color: "#ef4444" },
  { id: "inflow", labelKey: "dashboard.gain", color: "#10b981" },
];

export function FlowToggle({ value, onChange, className }) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex gap-0.5 rounded-lg bg-muted p-0.5", className)}>
      {FLOW_TABS.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-md transition-all duration-200",
              isActive
                ? tab.color
                  ? "text-white shadow-sm"
                  : "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={
              isActive && tab.color
                ? { backgroundColor: tab.color, boxShadow: `0 0 0 2px ${tab.color}20` }
                : undefined
            }
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
