import { BarChart3, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Button } from "@/shared/components/app-shadcn";

const MODES = [
  { id: "analytics", icon: BarChart3 },
  { id: "overview", icon: LayoutList },
];

export function BudgetViewModeToggle({ value, onChange, className }) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label={t("budgets.viewModeSwitch")}
    >
      {MODES.map(({ id, icon: Icon }) => {
        const active = value === id;
        return (
          <Button
            key={id}
            type="button"
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors sm:h-9 xl:px-3 xl:text-sm",
              !active && "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="hidden xl:inline">{t(`budgets.viewMode.${id}`)}</span>
          </Button>
        );
      })}
    </div>
  );
}
