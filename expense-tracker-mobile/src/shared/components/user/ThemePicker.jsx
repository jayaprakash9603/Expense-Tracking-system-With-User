import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/shared/hooks/theme/useTheme";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ThemePicker({ showModeToggle = false, compact = false }) {
  const { mode, palette, availablePalettes, setPaletteId, toggle } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {showModeToggle && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("settings.darkMode")}</span>
          <Switch checked={mode === "dark"} onCheckedChange={toggle} />
        </div>
      )}
      <div className={cn("grid gap-2", compact ? "grid-cols-5" : "grid-cols-5 sm:grid-cols-10")}>
        {availablePalettes.map((p) => (
          <button
            key={p.id}
            onClick={() => setPaletteId(p.id)}
            className={cn(
              "relative rounded-full transition-all duration-200",
              compact ? "h-8 w-8" : "h-10 w-10",
              palette === p.id && "ring-2 ring-offset-2 ring-offset-background ring-primary"
            )}
            style={{ backgroundColor: p.primary }}
            title={p.name}
          >
            {palette === p.id && (
              <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemePicker;
