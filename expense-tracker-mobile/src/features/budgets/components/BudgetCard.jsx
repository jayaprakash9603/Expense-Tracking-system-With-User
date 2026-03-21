import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/display/AppCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { Button, Progress } from "@/shared/components/app-shadcn";

export function BudgetCard({ budget, onEdit, onDelete, className }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
  const statusColor = budget.isOverBudget
    ? "text-destructive"
    : budget.percentage >= 80
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <AppCard className={cn("p-3 md:p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm md:text-base truncate">{budget.title}</h3>
          <p className="text-xs text-muted-foreground">{budget.subtitle}</p>
        </div>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onEdit(budget)}
              aria-label={t("common.edit")}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onDelete(budget)}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      <Progress value={budget.percentage} className="h-2 mb-2" />
      <div className="flex justify-between text-xs">
        <span className={cn("font-medium", statusColor)}>
          {format(budget.spent)} {t("budgets.of")} {format(budget.amount)}
        </span>
        <span className="text-muted-foreground">
          {format(budget.remaining)} {t("budgets.remaining")}
        </span>
      </div>
    </AppCard>
  );
}

export default BudgetCard;
