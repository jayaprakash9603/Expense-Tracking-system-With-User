import React from "react";
import { BarChart3 } from "lucide-react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { CHART_HEIGHTS } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function ChartEmptyState({ message, height = CHART_HEIGHTS.default, className }) {
  const { t } = useLanguage();
  const h =
    typeof height === "number" && Number.isFinite(height) && height > 0
      ? height
      : CHART_HEIGHTS.default;

  return (
    <div
      className={cn(
        "box-border flex w-full max-w-full flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/10 px-3 text-center text-muted-foreground sm:px-4",
        className,
      )}
      style={{ height: h, minHeight: h }}
    >
      <AppIcon icon={BarChart3} color="muted" size="xl" className="shrink-0 opacity-80" />
      <p className="max-w-[18rem] text-xs leading-snug sm:text-sm">{message || t("chart.noData")}</p>
    </div>
  );
}
