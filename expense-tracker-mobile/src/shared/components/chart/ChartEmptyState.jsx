import React from "react";
import { BarChart3 } from "lucide-react";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function ChartEmptyState({ message }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <AppIcon icon={BarChart3} color="muted" size="xl" className="mb-3" />
      <p className="text-sm">{message || t("chart.noData")}</p>
    </div>
  );
}
